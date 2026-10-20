import {required,uid} from './model.mjs';

export const TEAM_LIMIT=5;
export function actorClass(actor){
  const items=Array.from(actor?.items?.values?.()??actor?.items??[]);
  return String((items.find(i=>i.type==='class'&&i.system?.initial)??items.find(i=>i.type==='class'))?.name??actor?.system?.characterClass??'');
}
export function syncParticipants(state,actors){
  const rows=Array.from(actors?.values?.()??actors??[]);
  for(const member of [...(state.memberships??[]),...state.teams.flatMap(t=>t.members)]){
    const actor=rows.find(a=>a.id===member.actorId);if(!actor)continue;
    Object.assign(member,{name:actor.name,img:actor.img,role:actorClass(actor)||'Classe não definida'});
    if((state.memberships??[]).includes(member)){member.player=Boolean(actor.hasPlayerOwner);if(member.bettor)member.cash=Number(actor.system?.currency?.p??0);}
  }
  for(const event of state.events??[])for(const member of (event.lineup??[]).flat()){
    const actor=rows.find(a=>a.id===member.actorId);
    if(actor)member.img=actor.img;
  }
  return state;
}
export function ensureTeamSpace(team){if(team.members.length>=TEAM_LIMIT)throw Error('A equipe já tem cinco pessoas. Remova alguém antes de adicionar.');}
export function addTeam(state,input){
  const name=required(input.name);
  if(state.teams.some(t=>t.name.toLocaleLowerCase()===name.toLocaleLowerCase()))throw Error('Este nome de equipe já está em uso.');
  const team={id:uid(),name,visible:true,fame:0,sponsor:input.sponsor??'',sponsorActorId:input.sponsorActorId??'',members:[],wins:0,losses:0,statsInitialized:true,allowPlayers:false};state.teams.unshift(team);return team;
}
export function addTeamMember(state,teamId,actor){
  const team=state.teams.find(t=>t.id===teamId);
  if(!team||actor?.type!=='character')throw Error('Escolha uma equipe e uma ficha de personagem. Ameaças não podem se inscrever.');
  ensureTeamSpace(team);
  if(state.teams.some(t=>t.members.some(m=>m.actorId===actor.id)))throw Error('Este personagem já pertence a uma equipe.');
  team.members.push({actorId:actor.id,name:actor.name,img:actor.img,role:actorClass(actor)||'Classe não definida'});
}
function activeFor(state,teamId,actorId){
  return state.events.some(ev=>['open','closed','live'].includes(ev.status)&&(teamId?ev.teamIds?.includes(teamId):[...(ev.lineup??[]).flat().map(m=>m.actorId),...(ev.duel?.participants??[]),...(ev.battle?.participants??[]).flat()].includes(actorId)));
}
export function removeTeamMember(state,teamId,memberKey){
  const team=state.teams.find(t=>t.id===teamId),member=team?.members.find(m=>(m.actorId||m.npcKey||m.name)===memberKey);
  if(!member)throw Error('Participante indisponível.');
  if(member.actorId&&activeFor(state,null,member.actorId))throw Error('Finalize ou anule a prova deste participante antes de removê-lo.');
  team.members=team.members.filter(m=>m!==member);
  if(team.ownerActorId===member.actorId)team.ownerActorId=team.members[0]?.actorId??'';
  state.invitations=(state.invitations??[]).filter(i=>!(i.teamId===team.id&&i.actorId===member.actorId));
}
export function removeTeam(state,id){
  if(activeFor(state,id))throw Error('Finalize ou anule as provas desta equipe antes de excluí-la.');
  state.teams=state.teams.filter(t=>t.id!==id);state.invitations=(state.invitations??[]).filter(i=>i.teamId!==id);
}
export function removePerson(state,actorId){
  if(activeFor(state,null,actorId))throw Error('Finalize ou anule a prova deste participante antes de removê-lo.');
  for(const team of state.teams)if(team.members.some(m=>m.actorId===actorId))removeTeamMember(state,team.id,actorId);
  state.memberships=(state.memberships??[]).filter(m=>m.actorId!==actorId);
  state.invitations=(state.invitations??[]).filter(i=>i.actorId!==actorId);
  state.enrollments=(state.enrollments??[]).filter(i=>i.actorId!==actorId);
}
export function removeBettor(state,id){
  if(state.bets.some(b=>b.bettorId===id&&b.status==='pending'))throw Error('Este apostador ainda tem apostas em aberto. Finalize ou anule as provas antes de removê-lo.');
  state.bettors=state.bettors.filter(b=>b.id!==id);
}
