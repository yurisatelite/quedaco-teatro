import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {CATALOG} from '../src/catalog.mjs';
import {initialState,normalizeState,publicState,settleEvent,placeBet} from '../src/model.mjs';
import {addTeam,addTeamMember,removeTeamMember,removeTeam,removePerson,removeBettor,syncParticipants} from '../src/participation.mjs';
import {createCircuitEvent,editEventParticipants} from '../src/circuit.mjs';
import {CIRCUIT_NPCS,repairCircuitImages,restoreCircuitLinks} from '../src/roster.mjs';
import {renderView} from '../src/view.mjs';
const actor=(id,player=false)=>({id,name:id,type:'character',hasPlayerOwner:player,img:`${id}.png`,items:[{type:'class',name:'Especialista',system:{initial:true}}],system:{currency:{p:120}}});

test('equipes vazias são editáveis; remoção preserva bilhetes e não aceita ameaças nem sexto membro',()=>{
 const s=normalizeState(initialState(CATALOG)),team=addTeam(s,{name:'Novos'});
 assert.equal(s.teams[0],team);assert.equal(team.wins,0);
 assert.throws(()=>addTeamMember(s,team.id,{id:'monster',type:'npc'}),/Ameaças/);
 for(let i=0;i<5;i++)addTeamMember(s,team.id,actor(`a${i}`));
 assert.throws(()=>addTeamMember(s,team.id,actor('a5')),/cinco/);
 assert.equal(team.members[0].role,'Especialista');
 s.bets.push({id:'ticket',actorId:'a0',status:'won',payout:20});
 s.memberships=[{actorId:'a0'}];removeTeamMember(s,team.id,'a0');assert.equal(team.members.length,4);assert.equal(s.memberships.length,1);
 removePerson(s,'a0');assert.equal(s.memberships.length,0);assert.equal(s.bets.length,1);
 s.invitations=[{teamId:team.id,actorId:'a9'}];removeTeam(s,team.id);assert.equal(s.teams.length,0);assert.equal(s.invitations.length,0);
});

test('duelo direto permite inscritos sem equipe; edição reembolsa NPCs, protege apostas reais e histórico',()=>{
 const s=normalizeState(initialState(CATALOG)),actors=[actor('a'),actor('b'),actor('c'),actor('player',true)];
 s.bettors=[{id:'book',name:'NPC',bankroll:200}];
 const ev=createCircuitEvent(s,{game:'Duelo do Anel',duelSide0ActorId:'a',duelSide1ActorId:'b'},{actors,random:()=>.1});
 assert.deepEqual(ev.sides,['a','b']);assert.deepEqual(ev.simulationWeights,[1,1]);
 const before=s.bets[0];editEventParticipants(s,ev.id,{duelSide0ActorId:'c',duelSide1ActorId:'b'},{actors});
 assert.equal(before.status,'refunded');assert.equal(before.payout,before.stake);assert.equal(ev.sides[0],'c');assert.equal(s.bets.filter(b=>b.status==='pending').length,1);
 assert.throws(()=>removePerson(s,'c'),/Finalize/);assert.throws(()=>removeBettor(s,'book'),/aberto/);
 placeBet(s,{eventId:ev.id,bettor:'Jogador',stake:10,side:0});s.bets.at(-1).actorId='player';
 assert.throws(()=>editEventParticipants(s,ev.id,{duelSide0ActorId:'a',duelSide1ActorId:'b'},{actors}),/jogadores/);
 settleEvent(s,ev.id,'void');removeBettor(s,'book');assert.equal(s.bettors.length,0);assert.equal(s.bets.length,3);
 assert.throws(()=>createCircuitEvent(s,{game:'Duelo do Anel',mode:'table',duelSide0ActorId:'player',duelSide1ActorId:'b'},{actors}),/inscrito/);
 s.memberships.push({actorId:'player'});const table=createCircuitEvent(s,{game:'Duelo do Anel',mode:'table',duelSide0ActorId:'player',duelSide1ActorId:'b'},{actors});assert.equal(table.lineup[0][0].actorId,'player');
 assert.throws(()=>createCircuitEvent(s,{game:'Duelo do Anel',duelSide0ActorId:'player',duelSide1ActorId:'b'},{actors}),/NPC/);
});

test('sincronização migra classes antigas e publica só saldo dos jogadores apostadores',()=>{
 const s=normalizeState(initialState(CATALOG)),actors=[actor('player',true),actor('npc')];
 s.memberships=[{actorId:'player',role:'Automático',bettor:true},{actorId:'npc',bettor:true}];
 s.teams=[{id:'team',visible:true,members:[{actorId:'player',role:'Combatente'}]}];
 s.events=[{lineup:[[{actorId:'player',name:'Nome na inscrição',img:'antigo.png'}],[]]}];
 syncParticipants(s,actors);assert.equal(s.teams[0].members[0].role,'Especialista');
 assert.equal(s.events[0].lineup[0][0].img,'player.png');assert.equal(s.events[0].lineup[0][0].name,'Nome na inscrição');
 s.events=[];
 const p=publicState(s);assert.equal(p.memberships.length,1);assert.equal(p.memberships[0].cash,120);assert.equal(p.memberships[0].role,'Especialista');
});

test('vínculos recuperados usam a chave do modelo mesmo após mudar o nome',()=>{
 const s=normalizeState(initialState(CATALOG)),row=CIRCUIT_NPCS[0];
 s.teams=[{members:[{npcKey:row.key,name:'Nome alterado',actorId:'apagado'}]}];
 const a={...actor('existente'),flags:{'quedaco-teatro':{npc:{key:row.key}}}};
 restoreCircuitLinks(s,[a]);assert.equal(s.teams[0].members[0].actorId,'existente');
 assert.equal(s.teams[0].members[0].img,'existente.png');
 s.teams[0].members=[];restoreCircuitLinks(s,[a]);assert.equal(s.teams[0].members.length,0);
});

test('provas encerradas saem do início; equipe sem elenco/fama e resgate disponível após remoção',()=>{
 const s=normalizeState(initialState(CATALOG));addTeam(s,{name:'Vazia'});
 const ev=createCircuitEvent(s,{game:'Duelo do Anel',duelSide0ActorId:'a',duelSide1ActorId:'b'},{actors:[actor('a'),actor('b')]});settleEvent(s,ev.id,0);
 const home=renderView({state:s,gm:true});assert.doesNotMatch(home,/qt-event-tile/);
 const events=renderView({state:s,gm:true,tab:'events'});assert.match(events,/qt-finished"><summary>Provas finalizadas · 1/);
 const teams=renderView({state:s,gm:true,tab:'teams'});assert.match(teams,/Equipe vazia/);assert.doesNotMatch(teams,/nenhuma criação pendente|name="role"|Fama|data-qt-action="fame"/);
 s.bets=[{id:'old',actorId:'player',eventId:ev.id,stake:10,status:'won',payout:20}];
 const history=renderView({state:publicState(s),tab:'my-bets',actors:[{id:'player',items:[],cash:20}]});assert.match(history,/Resgatar ganhos em dinheiro/);assert.doesNotMatch(history,/data-qt-bet/);
});

test('44 retratos únicos existem; atualização preserva imagem personalizada e corrige tokens antigos',async()=>{
 const hashes=[];for(const row of CIRCUIT_NPCS){const path=new URL(`../assets/npc/${row.key}.png`,import.meta.url);hashes.push(createHash('sha256').update(await readFile(path)).digest('hex'));}assert.equal(new Set(hashes).size,44);
 const [first,second]=CIRCUIT_NPCS,updates=[];
 const actors=[{...actor('a'),flags:{'quedaco-teatro':{npc:{key:first.key}}},img:'modules/quedaco-teatro/assets/npc/teatro-portrait-arena.png',prototypeToken:{texture:{src:'icons/svg/mystery-man.svg'}},async update(data){updates.push(data);}},{...actor('b'),flags:{'quedaco-teatro':{npc:{key:second.key}}},img:'custom.png',prototypeToken:{texture:{src:'custom-token.png'}},async update(data){updates.push(data);}}];
 const scene={tokens:[{id:'token',actorId:'a',texture:{src:'icons/svg/mystery-man.svg'}}],async updateEmbeddedDocuments(type,data){assert.equal(type,'Token');assert.equal(data[0]['texture.src'],first.model.token);}};
 await repairCircuitImages({game:{actors,scenes:[scene]}});assert.equal(updates[0].img,first.model.portrait);assert.equal(updates[1].img,'custom.png');assert.equal(updates[1]['prototypeToken.texture.src'],'custom-token.png');
});
