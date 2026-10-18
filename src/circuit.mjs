import {addEvent,placeBet,settleEvent,uid} from './model.mjs';
export const PRESETS={
  'Duelo do Anel':{id:'duelo',size:1,terrain:'Anel da Areia Negra',reward:'60 pilas',target:3},
  'Batalha de Equipes':{id:'equipes',size:3,terrain:'Arena das Bandeiras',reward:'120 pilas por equipe',target:3},
  'Corrida dos Escorpiões':{id:'corrida',size:1,terrain:'Pista de Mirmir · três voltas',reward:'80 pilas',target:3},
  'O Jogo do Silêncio':{id:'silencio',size:3,terrain:'Pátio das Campânulas',reward:'90 pilas por equipe',target:3}
};
export function createCircuitEvent(state,input,{actors=[],random=Math.random}={}){
  const preset=PRESETS[input.game];if(!preset)throw Error('Escolha uma modalidade disponível.');
  const eligible=state.teams.filter(t=>t.members.filter(m=>m.actorId&&actors.some(a=>a.id===m.actorId&&!a.hasPlayerOwner)).length>=preset.size);
  if(eligible.length<2)throw Error('Sincronize o elenco: são necessárias duas equipes com fichas de NPC vinculadas.');
  const a=input.teamA?eligible.find(t=>t.id===input.teamA):eligible[Math.floor(random()*eligible.length)];
  const others=eligible.filter(t=>t.id!==a?.id),b=input.teamB?others.find(t=>t.id===input.teamB):others[Math.floor(random()*others.length)];
  if(!a||!b)throw Error('Escolha duas equipes diferentes com NPCs disponíveis.');
  const snapshots=[a,b].map(t=>t.members.filter(m=>actors.some(a=>a.id===m.actorId&&!a.hasPlayerOwner)).slice(0,preset.size).map(m=>{const actor=actors.find(a=>a.id===m.actorId);return {actorId:actor.id,name:actor.name,img:actor.img,role:m.role};}));
  const number=(state.eventSequence??state.events.length)+1;state.eventSequence=number;
  const sides=preset.size===1?snapshots.map(rows=>rows[0].name):[a.name,b.name];
  addEvent(state,{...input,name:`Prova ${String(number).padStart(6,'0')}`,a:sides[0],b:sides[1],teamA:a.id,teamB:b.id,terrain:preset.terrain,reward:input.reward||preset.reward,oddsA:2,oddsB:2,duelSide0ActorId:snapshots[0][0].actorId,duelSide1ActorId:snapshots[1][0].actorId,side0ActorIds:snapshots[0].map(m=>m.actorId),side1ActorIds:snapshots[1].map(m=>m.actorId)});
  const event=state.events.at(-1);event.mode=input.mode==='table'?'table':'simulated';event.lineup=snapshots;
  event.simulationWeights=[a,b].map(t=>Math.max(1,10+Number(t.fame||0)));
  for(const bettor of state.bettors){if(bettor.bankroll<1)continue;const stake=Math.min(Math.floor(bettor.bankroll),Math.max(1,Math.floor(bettor.bankroll*(.02+random()*.06))));placeBet(state,{eventId:event.id,bettorId:bettor.id,side:random()<.5?0:1,stake},uid());}
  return event;
}
export function finishSimulation(state,eventId,{random=Math.random}={}){
  const event=state.events.find(e=>e.id===eventId);
  if(!event||event.mode!=='simulated'||event.status!=='closed')throw Error('Encerre as apostas de uma prova simulada antes de sortear.');
  const weights=event.simulationWeights,total=weights[0]+weights[1],draw=Math.floor(random()*total)+1,winner=draw<=weights[0]?0:1;
  const score=winner===0?[3,Math.floor(random()*3)]:[Math.floor(random()*3),3];
  const reasons={duelo:['um desarme preciso decidiu a troca final','a pressão constante provocou a rendição'],equipes:['a formação protegeu o portador e conquistou o último estandarte','uma manobra de flanco quebrou a defesa'],corrida:['a montaria manteve o ritmo na última curva','um atalho nas dunas garantiu a chegada'],silencio:['a coordenação por sinais evitou as campânulas','a travessia final foi concluída sem ruído']};
  const id=PRESETS[event.game].id,list=reasons[id];event.result={winner,score,draw,total,weights:[...weights],reason:`${event.sides[winner]} venceu: ${list[Math.floor(random()*list.length)]}.`,method:'Sorteio autoral ponderado pela fama das equipes'};
  if(event.battle)event.battle.score=[...score];if(event.duel)event.duel.score=[...score];
  settleEvent(state,eventId,winner);return event.result;
}
