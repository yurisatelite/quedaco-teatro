import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,normalizeState,publicState} from '../src/model.mjs';
import {CATALOG} from '../src/catalog.mjs';
import {installCircuit,CIRCUIT_NPCS,restoreCircuitLinks} from '../src/roster.mjs';
import {PRESETS,createCircuitEvent,finishSimulation} from '../src/circuit.mjs';
test('rodadas usam fichas de NPC, geram apostas solventes e finalizam uma única vez',()=>{
 const s=normalizeState(initialState(CATALOG));installCircuit(s);
 const actors=CIRCUIT_NPCS.map((row,i)=>({id:`a${i}`,name:row.model.name,img:row.model.portrait,flags:{'quedaco-personagens-skyfall-rpg':{npcModel:{id:row.model.id}}}}));restoreCircuitLinks(s,actors);
 for(const game of Object.keys(PRESETS)){
  const ev=createCircuitEvent(s,{game},{actors,random:()=>.2});assert.equal(ev.lineup[0].length,PRESETS[game].size);assert.ok(s.bets.some(b=>b.eventId===ev.id));
  assert.throws(()=>finishSimulation(s,ev.id));ev.status='closed';const result=finishSimulation(s,ev.id,{random:()=>.1});assert.equal(result.winner,0);assert.equal(ev.status,'settled');
  const treasury=s.treasury;assert.throws(()=>finishSimulation(s,ev.id));assert.equal(s.treasury,treasury);
 }
 assert.ok(s.bettors.every(b=>b.bankroll>=0));const visible=publicState(s);assert.equal(visible.events.length,4);assert.ok(visible.events.every(e=>e.result.reason&&e.lineup[0][0].img));
 assert.throws(()=>createCircuitEvent(s,{game:'Duelo do Anel'},{actors:actors.map(a=>({...a,hasPlayerOwner:true}))}));
});
