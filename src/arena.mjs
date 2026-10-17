import {ID} from './model.mjs';

export const ARENA_MAP=Object.freeze({
  id:'areia-prova',title:'Areia da Prova',
  src:'modules/quedaco-teatro/assets/maps/quedaco-teatro-areia-prova-v1.png',
  width:3000,height:2000,grid:100,columns:30,rows:20,
  spawns:[[{x:200,y:700},{x:200,y:900},{x:200,y:1100}],[{x:2700,y:700},{x:2700,y:900},{x:2700,y:1100}]]
});

const rows=value=>Array.from(value??[]);
const actorById=(actors,id)=>actors?.get?.(id)??rows(actors).find(actor=>actor.id===id);

export function defaultParticipants(event,state){
  return [0,1].map(side=>{
    const chosen=rows(event.battle?.participants?.[side]).filter(Boolean);
    if(chosen.length)return chosen;
    const team=state.teams.find(row=>row.id===event.teamIds?.[side]);
    return rows(team?.members).map(member=>member.actorId).filter(Boolean).slice(0,3);
  });
}

export function resolveParticipants(event,state,actors){
  const ids=defaultParticipants(event,state);
  if(ids.some(side=>side.length!==3))throw Error('Escolha exatamente três Actors para cada lado antes de montar a arena.');
  const unique=new Set(ids.flat());if(unique.size!==6)throw Error('Um Actor não pode lutar nos dois lados da mesma Batalha de Equipes.');
  return ids.map(side=>side.map(id=>{
    const actor=actorById(actors,id);if(!actor)throw Error('Um Actor escalado não está mais disponível no mundo.');return actor;
  }));
}

async function tokenSource(actor,{x,y,side,eventId}){
  let source;
  if(typeof actor.getTokenDocument==='function')source=(await actor.getTokenDocument({x,y,hidden:false,disposition:side===0?1:-1})).toObject();
  else source=structuredClone(actor.prototypeToken?.toObject?.()??actor.prototypeToken??{});
  delete source._id;source.actorId=actor.id;source.x=x;source.y=y;source.hidden=false;source.disposition=side===0?1:-1;
  source.flags??={};source.flags[ID]={...(source.flags[ID]??{}),arena:{eventId,side,spawnedAt:Date.now()}};
  return source;
}

async function ensureScene(event,{game,SceneClass}){
  const existing=event.battle?.sceneId&&actorById(game.scenes,event.battle.sceneId);
  if(existing)return existing;
  const Source=SceneClass??globalThis.Scene??globalThis.foundry?.documents?.Scene;
  if(!Source?.create)throw Error('A API de Cenas do Foundry não está disponível.');
  return Source.create({name:`${event.name} · ${ARENA_MAP.title}`,width:ARENA_MAP.width,height:ARENA_MAP.height,padding:0.1,grid:{type:1,size:ARENA_MAP.grid,distance:1,units:'m'},background:{src:ARENA_MAP.src},navigation:false,flags:{[ID]:{arena:{eventId:event.id,mapId:ARENA_MAP.id}}}});
}

/** Prepara ou reconstrói somente os Tokens e o Combate pertencentes a esta prova. */
export async function prepareArena(event,state,{game=globalThis.game,SceneClass,CombatClass}={}){
  if(!game.user?.isGM)throw Error('Somente a Mestra pode montar a arena.');
  if(!event?.battle)throw Error('Esta prova não usa a arena de Batalha de Equipes.');
  const sides=resolveParticipants(event,state,game.actors),scene=await ensureScene(event,{game,SceneClass});
  const oldTokens=rows(scene.tokens).filter(token=>token.flags?.[ID]?.arena?.eventId===event.id).map(token=>token.id);
  if(oldTokens.length)await scene.deleteEmbeddedDocuments('Token',oldTokens);
  const sources=[];
  for(const [side,actors] of sides.entries())for(const [index,actor] of actors.entries())sources.push(await tokenSource(actor,{...ARENA_MAP.spawns[side][index],side,eventId:event.id}));
  const tokens=await scene.createEmbeddedDocuments('Token',sources);
  const Combat=CombatClass??globalThis.Combat??globalThis.foundry?.documents?.Combat;
  if(!Combat?.create)throw Error('A API de Combates do Foundry não está disponível.');
  const oldCombat=event.battle.combatId&&actorById(game.combats,event.battle.combatId);
  if(oldCombat)await oldCombat.delete();
  const combat=await Combat.create({name:event.name,scene:scene.id,active:true,flags:{[ID]:{arena:{eventId:event.id}}}});
  const combatants=await combat.createEmbeddedDocuments('Combatant',tokens.map(token=>({
    tokenId:token.id,actorId:token.actorId,hidden:false,
    flags:{[ID]:{arena:{eventId:event.id,side:token.flags?.[ID]?.arena?.side}}}
  })));
  if(combatants.length)await combat.rollInitiative(combatants.map(row=>row.id));
  return {sceneId:scene.id,combatId:combat.id,tokenIds:tokens.map(token=>token.id),participants:sides.map(side=>side.map(actor=>actor.id))};
}

export async function openArena(sceneId,{game=globalThis.game}={}){
  if(!game.user?.isGM)throw Error('Somente a Mestra pode abrir a arena.');
  const scene=actorById(game.scenes,sceneId);if(!scene)throw Error('A cena desta batalha não existe mais.');
  await scene.activate?.();
  await scene.view?.();
  return scene;
}
