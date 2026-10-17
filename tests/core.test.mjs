import test from 'node:test';
import assert from 'node:assert/strict';
import {CATALOG} from '../src/catalog.mjs';
import {ID,initialState,publicState,addBettor,addEvent,placeBet,recordBattle,settleEvent,startBattle} from '../src/model.mjs';
import {createStore} from '../src/store.mjs';
import {renderView} from '../src/view.mjs';
import {CIRCUIT_BETTORS,CIRCUIT_NPCS,CIRCUIT_PERSONNEL,CIRCUIT_TEAMS,applyCircuitActorLinks,createCircuitActors,installCircuit,synchronizeCircuitCompetitorTags} from '../src/roster.mjs';
import {ARENA_MAP,prepareArena,resolveParticipants} from '../src/arena.mjs';
const fixture=()=>{
  const game={user:{isGM:true},journal:[]};
  const create=async record=>{
    const doc={...structuredClone(record),testUserPermission(user){return user.isGM||this.ownership.default>=2;},async update(next){Object.assign(this,structuredClone(next));return this;}};
    game.journal.push(doc);return doc;
  };
  return {game,store:createStore(game,{create,seed:async()=>CATALOG})};
};
const event=s=>addEvent(s,{name:'Final',a:'Areia',b:'Sangue',oddsA:1.75,oddsB:2.2,game:'Duelo'},'ev');
test('projeção pública usa campos explícitos e remove notas, contas e segredos',()=>{
  const s=initialState(CATALOG);s.notes='SEGREDO-PRIVADO';s.entries[0].secret='SEGREDO-DO-NPC';s.contracts.push({terms:'SEGREDO-CONTRATO'});s.bets.push({bettor:'SEGREDO-APOSTA'});
  event(s);s.events[0].secret='SEGREDO-DA-PROVA';s.teams.push({id:'t',name:'Público',fame:4,visible:true,sponsor:'SEGREDO-PATRONO'},{id:'hidden',name:'SEGREDO-EQUIPE',visible:false});
  const p=publicState(s);
  assert.doesNotMatch(JSON.stringify(p),/SEGREDO/);
  assert.equal(p.entries.some(r=>r.id==='ruinas'),false);
  assert.equal(p.teams.length,1);
  assert.doesNotMatch(renderView({state:p}),/data-qt-action="publish"|data-qt-form|Segredos e condução|Livro de apostas/);
});
test('apostas fixam cotação, pagam uma vez e preservam caixa',()=>{
  const s=initialState(CATALOG);event(s);
  placeBet(s,{eventId:'ev',bettor:'Ana',side:0,stake:100},'b1');
  placeBet(s,{eventId:'ev',bettor:'Beto',side:1,stake:50},'b2');
  s.events[0].odds[0]=99;
  settleEvent(s,'ev',0);
  assert.equal(s.bets[0].payout,175);assert.equal(s.bets[1].payout,0);assert.equal(s.treasury,-25);
  assert.throws(()=>settleEvent(s,'ev',0),/encerrado/);
  assert.throws(()=>placeBet(s,{eventId:'ev',bettor:'C',side:0,stake:10}),/encerradas/);
});
test('anulação devolve apostas; entradas inválidas não alteram caixa',()=>{
  const s=initialState(CATALOG);event(s);
  for(const stake of [-1,0,NaN,Infinity,'abc'])assert.throws(()=>placeBet(s,{eventId:'ev',bettor:'A',side:0,stake}));
  assert.equal(s.bets.length,0);
  placeBet(s,{eventId:'ev',bettor:'A',side:1,stake:12.34});
  s.events[0].status='closed';
  assert.throws(()=>placeBet(s,{eventId:'ev',bettor:'A',side:0,stake:10}));
  settleEvent(s,'ev','void');assert.equal(s.treasury,0);assert.equal(s.bets[0].status,'refunded');
});
test('batalha de equipes encerra apostas no início e liquida ao atingir o objetivo',()=>{
  const s=initialState(CATALOG);
  addEvent(s,{name:'Areia contra Sangue',game:'Batalha de Equipes',a:'Areia',b:'Sangue',oddsA:2,oddsB:2,format:'3 contra 3',condition:'objetivos',target:2,deaths:'permitida',roundLimit:6},'battle');
  placeBet(s,{eventId:'battle',bettor:'Torcida',side:0,stake:10});
  startBattle(s,'battle');
  assert.equal(s.events[0].status,'live');
  assert.throws(()=>placeBet(s,{eventId:'battle',bettor:'Atrasado',side:1,stake:1}),/encerradas/);
  recordBattle(s,'battle',0,'point');assert.equal(s.events[0].battle.score[0],1);
  recordBattle(s,'battle',0,'point');
  assert.equal(s.events[0].status,'settled');assert.equal(s.events[0].winner,0);assert.equal(s.bets[0].payout,20);
});
test('apostador cadastrado precisa ter caixa e recebe o retorno no próprio registro',()=>{
  const s=initialState(CATALOG);event(s);addBettor(s,{name:'Lume',origin:'Mirmir',purpose:'Pagar a caravana',style:'Prudente',bankroll:25,debt:5},'lume');
  placeBet(s,{eventId:'ev',bettorId:'lume',side:1,stake:20});assert.equal(s.bettors[0].bankroll,5);
  assert.throws(()=>placeBet(s,{eventId:'ev',bettorId:'lume',side:0,stake:6}),/fichas suficientes/);
  settleEvent(s,'ev',1);assert.equal(s.bettors[0].bankroll,49);
});
test('circuito inicial cria equipes, elenco, apostadores e não pode ser duplicado',()=>{
  const s=initialState(CATALOG);installCircuit(s);
  assert.equal(s.teams.length,CIRCUIT_TEAMS.length);assert.equal(s.bettors.length,CIRCUIT_BETTORS.length);assert.equal(s.personnel.length,CIRCUIT_PERSONNEL.length);
  assert.equal(s.teams.flatMap(t=>t.members).length,16);
  assert.throws(()=>installCircuit(s),/já foi instalado/);
  assert.doesNotMatch(JSON.stringify(publicState(s)),/Cinta Negra|Mão de Cobre|Hedra Pálida/);
});
test('modelos do circuito são detalhados, estáveis e a sincronização não duplica Actors',async()=>{
  assert.equal(CIRCUIT_NPCS.length,40);
  assert.equal(new Set(CIRCUIT_NPCS.map(row=>row.model.id)).size,40);
  for(const row of CIRCUIT_NPCS){
    assert.match(row.model.appearance,/./);assert.match(row.model.routine,/./);assert.match(row.model.desire,/./);assert.ok(row.model.possessions.length>=3);
  }
  const actors=CIRCUIT_NPCS.map((row,index)=>({id:`a${index}`,uuid:`Actor.a${index}`,flags:{},async setFlag(scope,key,value){this.flags[scope]??={};this.flags[scope][key]=value;}}));
  const calls=[];
  const creator={capabilities:{npcTemplates:true},async prepareNpcTemplate(model){return {signature:`sig:${model.id}`};},async createNpcFromTemplate(model,{expectedSignature}){calls.push([model.id,expectedSignature]);const index=CIRCUIT_NPCS.findIndex(row=>row.model.id===model.id);return {status:'existing',actorUuid:actors[index].uuid};}};
  const result=await createCircuitActors(creator,{game:{actors}});
  assert.equal(result.created,0);assert.equal(result.existing,40);assert.equal(calls.length,40);
  assert.equal(actors.filter(actor=>actor.flags['quedaco-teatro']?.competitor).length,16);
  const s=initialState(CATALOG);installCircuit(s);applyCircuitActorLinks(s,result.linked);
  assert.equal(s.teams.flatMap(team=>team.members).filter(member=>member.actorId).length,16);
  assert.equal(s.bettors.filter(row=>row.actorId).length,16);assert.equal(s.personnel.filter(row=>row.actorId).length,8);
  await synchronizeCircuitCompetitorTags(s,{game:{actors:{get:id=>actors.find(actor=>actor.id===id)}}});
  assert.ok(actors.filter(actor=>actor.flags['quedaco-teatro']?.competitor?.teamId).length===16);
});
test('arena cria Cena, seis Tokens nas zonas, Combate e iniciativa sem aceitar escalação inválida',async()=>{
  const s=initialState(CATALOG);const actors=Array.from({length:6},(_,index)=>({id:`actor-${index}`,name:`Actor ${index}`,prototypeToken:{toObject:()=>({name:`Actor ${index}`})},async getTokenDocument(data){return {toObject:()=>({name:this.name,...data})};}}));
  addEvent(s,{name:'Prova da Areia',a:'Lado A',b:'Lado B',oddsA:2,oddsB:2,game:'Batalha de Equipes',format:'3 contra 3',side0ActorIds:actors.slice(0,3).map(actor=>actor.id),side1ActorIds:actors.slice(3).map(actor=>actor.id)},'arena');
  assert.equal(resolveParticipants(s.events[0],s,actors).flat().length,6);
  const scene={id:'scene-1',tokens:[],async createEmbeddedDocuments(type,sources){assert.equal(type,'Token');this.tokens=sources.map((source,index)=>({id:`token-${index}`,...source}));return this.tokens;},async deleteEmbeddedDocuments(){}};
  const combat={id:'combat-1',async createEmbeddedDocuments(type,sources){assert.equal(type,'Combatant');return sources.map((source,index)=>({id:`combatant-${index}`,...source}));},async rollInitiative(ids){this.initiative=ids;}};
  const result=await prepareArena(s.events[0],s,{game:{user:{isGM:true},actors,scenes:[],combats:[]},SceneClass:{async create(source){assert.equal(source.background.src,ARENA_MAP.src);assert.equal(source.width,3000);return scene;}},CombatClass:{async create(source){assert.equal(source.scene,scene.id);return combat;}}});
  assert.equal(result.sceneId,scene.id);assert.equal(result.combatId,combat.id);assert.equal(scene.tokens.length,6);assert.deepEqual(scene.tokens.slice(0,3).map(token=>token.x),[200,200,200]);assert.deepEqual(scene.tokens.slice(3).map(token=>token.x),[2700,2700,2700]);assert.equal(combat.initiative.length,6);
  s.events[0].battle.participants=[actors.slice(0,3).map(actor=>actor.id),[actors[0].id,...actors.slice(4).map(actor=>actor.id)]];
  assert.throws(()=>resolveParticipants(s.events[0],s,actors),/dois lados/);
});
test('publicar é explícito, persiste e retirada limpa a cópia pública',async()=>{
  const {store,game}=fixture();await store.initialize();await store.initialize();assert.equal(game.journal.length,1);
  await store.mutate(s=>{s.notes='SEGREDO';s.announcement='Primeiro cartaz';});
  assert.equal(store.published(),null);await store.publish();
  await store.mutate(s=>{s.announcement='Próximo cartaz';});
  assert.equal(store.published().announcement,'Primeiro cartaz');
  const reconnected=createStore(game);assert.equal(reconnected.published().announcement,'Primeiro cartaz');
  await store.publish();assert.equal(store.published().announcement,'Próximo cartaz');
  assert.equal(game.journal[0].ownership.default,0);
  assert.doesNotMatch(JSON.stringify(game.journal[1]),/SEGREDO/);
  await store.withdraw();assert.equal(store.published(),null);
  assert.deepEqual(game.journal[1].flags[ID].publication.active,false);
  assert.equal(game.journal[1].flags[ID].publication.entries,undefined);
});
test('jogadores não podem ler direção, alterar, publicar ou inicializar',async()=>{
  const {store,game}=fixture();await store.initialize();await store.publish();game.user={isGM:false};
  assert.throws(()=>store.read(),/mestre/);
  for(const action of [()=>store.initialize(),()=>store.mutate(()=>{}),()=>store.publish(),()=>store.withdraw()])await assert.rejects(action,/mestre/);
  assert.ok(store.published());
});
test('revisão antiga é rejeitada e falha não bloqueia a fila',async()=>{
  const {store}=fixture();await store.initialize();
  await store.mutate(s=>{s.notes='Mantido';},0);
  await assert.rejects(()=>store.mutate(s=>{s.notes='Perdido';},0),/mudaram/);
  await assert.rejects(()=>store.mutate(()=>{throw Error('Falha');}),/Falha/);
  assert.equal(store.read().notes,'Mantido');
  await store.mutate(s=>{s.mood='Euforia';},1);assert.equal(store.read().revision,2);
});
test('texto do usuário é escapado em cards, nomes e formulários',()=>{
  const s=initialState(CATALOG);s.announcement='<img src=x onerror=alert(1)>';s.notes='</textarea><script>alert(1)</script>';
  assert.doesNotMatch(renderView({state:s,gm:true}),/<img src=x/);
  assert.doesNotMatch(renderView({state:s,gm:true,tab:'direction'}),/<script>/);
});
