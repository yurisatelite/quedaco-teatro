import {addEvent,placeBet,settleEvent,uid} from './model.mjs';
import {actorClass} from './participation.mjs';
export const PRESETS={
  'Duelo do Anel':{id:'duelo',size:1,terrain:'Anel da Areia Negra',reward:'60 pilas',target:3},
  'Batalha de Equipes':{id:'equipes',size:3,terrain:'Arena das Bandeiras',reward:'120 pilas por equipe',target:3},
  'Corrida dos Escorpiões':{id:'corrida',size:1,terrain:'Pista de Mirmir · três voltas',reward:'80 pilas',target:3},
  'O Jogo do Silêncio':{id:'silencio',size:3,terrain:'Pátio das Campânulas',reward:'90 pilas por equipe',target:3}
};
export function createCircuitEvent(state,input,{actors=[],random=Math.random}={}){
  const preset=PRESETS[input.game];if(!preset)throw Error('Escolha uma modalidade disponível.');
  if(!state.entries.some(row=>row.category==='game'&&row.name===input.game&&row.revealed))throw Error('Esta modalidade está desativada.');
  const table=input.mode==='table',valid=actor=>actor?.type==='character'&&(!actor.hasPlayerOwner||(table&&state.memberships?.some(m=>m.actorId===actor.id)));
  const eligible=state.teams.filter(t=>t.members.filter(m=>actors.some(a=>a.id===m.actorId&&valid(a))).length>=preset.size);
  const chosen=[],snapshots=[];
  for(let side=0;side<2;side++){
    const direct=input[`duelSide${side}ActorId`],requested=input[side===0?'teamA':'teamB'];
    let team,selected;
    if(preset.id==='duelo'&&direct){const actor=actors.find(a=>a.id===direct);if(!valid(actor))throw Error('Escolha um NPC ou, no modo mesa, um jogador inscrito. Ameaças não são aceitas.');selected=[actor];team=state.teams.find(t=>t.members.some(m=>m.actorId===actor.id));}
    else {const candidates=eligible.filter(t=>!chosen.some(c=>c?.id===t.id));team=requested?candidates.find(t=>t.id===requested):candidates[Math.floor(random()*candidates.length)];if(!team)throw Error('Escolha os duelistas diretamente ou vincule fichas a duas equipes disponíveis.');selected=team.members.map(m=>actors.find(a=>a.id===m.actorId)).filter(valid).slice(0,preset.size);}
    if(selected.some(a=>snapshots.flat().some(m=>m.actorId===a.id)))throw Error('O mesmo participante não pode lutar nos dois lados.');
    chosen.push(team);snapshots.push(selected.map(actor=>({actorId:actor.id,name:actor.name,img:actor.img,role:actorClass(actor)||'Classe não definida'})));
  }
  const [a,b]=chosen;
  const number=(state.eventSequence??state.events.length)+1;state.eventSequence=number;
  const sides=preset.size===1?snapshots.map(rows=>rows[0].name):[a.name,b.name];
  addEvent(state,{...input,name:`Prova ${String(number).padStart(6,'0')}`,a:sides[0],b:sides[1],teamA:a?.id??'',teamB:b?.id??'',terrain:preset.terrain,reward:input.reward||preset.reward,oddsA:2,oddsB:2,duelSide0ActorId:snapshots[0][0].actorId,duelSide1ActorId:snapshots[1][0].actorId,side0ActorIds:snapshots[0].map(m=>m.actorId),side1ActorIds:snapshots[1].map(m=>m.actorId)});
  const event=state.events.at(-1);event.mode=input.mode==='table'?'table':'simulated';event.lineup=snapshots;
  event.simulationWeights=[1,1];
  generateNpcBets(state,event,{random});
  return event;
}
function generateNpcBets(state,event,{random=Math.random}={}){
  for(const bettor of state.bettors){
    bettor.reserve??=Math.max(100,Number(bettor.bankroll)||100);
    if(bettor.bankroll<100){const refill=bettor.reserve-bettor.bankroll;bettor.bankroll+=refill;bettor.houseFunding=Number(bettor.houseFunding??0)+refill;}
    const stake=Math.min(100,Math.floor(bettor.bankroll),Math.max(1,Math.floor(bettor.bankroll*(.02+random()*.06))));placeBet(state,{eventId:event.id,bettorId:bettor.id,side:random()<.5?0:1,stake},uid());
  }
}
export function finishSimulation(state,eventId,{random=Math.random}={}){
  const event=state.events.find(e=>e.id===eventId);
  if(!event||event.mode!=='simulated'||event.status!=='closed')throw Error('Encerre as apostas de uma prova simulada antes de sortear.');
  const weights=[1,1],total=weights[0]+weights[1],draw=Math.floor(random()*total)+1,winner=draw<=weights[0]?0:1;
  const score=winner===0?[3,Math.floor(random()*3)]:[Math.floor(random()*3),3];
  const reasons={duelo:['um desarme preciso decidiu a troca final','a pressão constante provocou a rendição'],equipes:['a formação protegeu o portador e conquistou o último estandarte','uma manobra de flanco quebrou a defesa'],corrida:['a montaria manteve o ritmo na última curva','um atalho nas dunas garantiu a chegada'],silencio:['a coordenação por sinais evitou as campânulas','a travessia final foi concluída sem ruído']};
  const id=PRESETS[event.game].id,list=id==='duelo'?[`a troca final decidiu a vitória por ${event.duel?.victory??'rendição'}`]:reasons[id];event.result={winner,score,draw,total,weights:[...weights],reason:`${event.sides[winner]} venceu: ${list[Math.floor(random()*list.length)]}.`,method:'Sorteio autoral com chances iguais; fama desativada'};
  if(event.battle)event.battle.score=[...score];if(event.duel)event.duel.score=[...score];
  settleEvent(state,eventId,winner);return event.result;
}

export function editEventParticipants(state,eventId,input,{actors=[]}={}){
  const ev=state.events.find(e=>e.id===eventId);
  if(!ev?.duel||!['open','closed'].includes(ev.status))throw Error('A escalação só pode ser editada antes do duelo começar.');
  if(state.bets.some(b=>b.eventId===ev.id&&b.status==='pending'&&(b.actorId||!b.bettorId)))throw Error('Esta prova já recebeu apostas de jogadores ou avulsas. Anule-a e crie outra com a nova escalação para preservar os bilhetes.');
  if(ev.duel.sceneId)throw Error('O mapa desta prova já foi preparado. Anule e crie outra antes de trocar os duelistas.');
  const selected=[input.duelSide0ActorId,input.duelSide1ActorId].map(id=>actors.find(a=>a.id===id));
  if(selected.some(a=>a?.type!=='character'||(a.hasPlayerOwner&&(ev.mode==='simulated'||!state.memberships?.some(m=>m.actorId===a.id))))||selected[0].id===selected[1].id)throw Error('Escolha dois participantes válidos e diferentes; jogadores precisam estar inscritos e no modo mesa.');
  for(const bet of state.bets.filter(b=>b.eventId===ev.id&&b.status==='pending')){const bettor=state.bettors.find(b=>b.id===bet.bettorId);if(bettor)bettor.bankroll+=bet.stake;bet.status='refunded';bet.payout=bet.stake;state.treasury-=bet.stake;}
  ev.lineup=selected.map(a=>[{actorId:a.id,name:a.name,img:a.img,role:actorClass(a)||'Classe não definida'}]);ev.sides=selected.map(a=>a.name);ev.duel.participants=selected.map(a=>a.id);ev.teamIds=selected.map(a=>state.teams.find(t=>t.members.some(m=>m.actorId===a.id))?.id??'');ev.simulationWeights=[1,1];
  if(ev.status==='open')generateNpcBets(state,ev);
}
