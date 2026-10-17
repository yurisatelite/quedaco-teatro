import test from 'node:test';
import assert from 'node:assert/strict';
import {CATALOG} from '../src/catalog.mjs';
import {ID,initialState,publicState,addBettor,addEvent,placeBet,recordBattle,settleEvent,startBattle} from '../src/model.mjs';
import {createStore} from '../src/store.mjs';
import {renderView} from '../src/view.mjs';
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
