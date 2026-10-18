import {ID} from './model.mjs';

export const ARENA_MAP=Object.freeze({
  id:'areia-prova',title:'Areia da Prova',
  src:'modules/quedaco-teatro/assets/maps/quedaco-teatro-areia-prova-v1.png',
  width:3000,height:2000,grid:100,columns:30,rows:20,
  spawns:[[{x:200,y:700},{x:200,y:900},{x:200,y:1100}],[{x:2700,y:700},{x:2700,y:900},{x:2700,y:1100}]]
});
export const DUEL_MAP=Object.freeze({
  id:'anel-areia-negra',title:'Anel da Areia Negra',
  src:'modules/quedaco-teatro/assets/maps/quedaco-anel-areia-negra-v1.png',width:3000,height:2000,grid:100,columns:30,rows:20,
  spawns:[[{x:1200,y:950}],[{x:1700,y:950}]]
});
export const GAME_MAPS=Object.freeze({
  duelo:{id:'duelo',title:'Duelo do Anel · Anel da Areia Negra',src:DUEL_MAP.src,width:3000,height:2000,grid:100,notes:'Duas marcas de entrada ficam a oeste e leste do anel. Anuncie armas, magia, saída do círculo, enfermaria e a condição de vitória antes das apostas.'},
  equipes:{id:'equipes',title:'Batalha de Equipes · Areia da Prova',src:ARENA_MAP.src,width:3000,height:2000,grid:100,notes:'Três entradas por lado. Defina objetivo, alvo, rodadas, mortes e enfermaria; a prova usa as zonas oeste e leste.'},
  corrida:{id:'corrida',title:'Corrida dos Escorpiões · Pista de Mirmir',src:'modules/quedaco-teatro/assets/maps/quedaco-corrida-escorpioes-v1.png',width:3000,height:2000,grid:100,notes:'Largada ao sul. Três voltas; use as dunas, arcos e ruínas centrais como obstáculos, atalhos ou pontos de ultrapassagem.'},
  silencio:{id:'silencio',title:'Jogo do Silêncio · Pátio das Campânulas',src:'modules/quedaco-teatro/assets/maps/quedaco-jogo-silencio-v1.png',width:3000,height:2000,grid:100,notes:'Voz involuntária gera consequência anunciada. Sinos, água, cortinas e placas de pressão funcionam como perigos e pistas; sinais e planejamento são permitidos.'}
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
    const actor=actorById(actors,id);if(!actor)throw Error('Um Actor escalado não está mais disponível no mundo.');if(actor.hasPlayerOwner&&!state.memberships?.some(m=>m.actorId===id))throw Error(`${actor.name} precisa se inscrever no Coliseu antes de participar.`);return actor;
  }));
}

export function resolveDuelists(event,actors){
  const ids=rows(event.duel?.participants).map(String).filter(Boolean);
  if(ids.length!==2||ids[0]===ids[1])throw Error('Escolha dois Actors diferentes para montar o Duelo do Anel.');
  return ids.map(id=>{const actor=actorById(actors,id);if(!actor)throw Error('Um Actor escalado não está mais disponível no mundo.');return actor;});
}

async function tokenSource(actor,{x,y,side,eventId}){
  let source;
  if(typeof actor.getTokenDocument==='function')source=(await actor.getTokenDocument({x,y,hidden:false,disposition:side===0?1:-1})).toObject();
  else source=structuredClone(actor.prototypeToken?.toObject?.()??actor.prototypeToken??{});
  delete source._id;source.actorId=actor.id;source.x=x;source.y=y;source.hidden=false;source.disposition=side===0?1:-1;
  source.flags??={};source.flags[ID]={...(source.flags[ID]??{}),arena:{eventId,side,spawnedAt:Date.now()}};
  return source;
}

async function ensureScene(event,config,{game,SceneClass}){
  const existing=(event.battle?.sceneId??event.duel?.sceneId)&&actorById(game.scenes,event.battle?.sceneId??event.duel?.sceneId);
  if(existing)return existing;
  const Source=SceneClass??globalThis.Scene??globalThis.foundry?.documents?.Scene;
  if(!Source?.create)throw Error('A API de Cenas do Foundry não está disponível.');
  return Source.create({name:`${event.name} · ${config.title}`,width:config.width,height:config.height,padding:0.1,grid:{type:1,size:config.grid,distance:1,units:'m'},background:{src:config.src},navigation:false,flags:{[ID]:{arena:{eventId:event.id,mapId:config.id}}}});
}

/** Prepara ou reconstrói somente os Tokens e o Combate pertencentes a esta prova. */
export async function prepareArena(event,state,{game=globalThis.game,SceneClass,CombatClass}={}){
  if(!game.user?.isGM)throw Error('Somente a Mestra pode montar a arena.');
  if(!event?.battle)throw Error('Esta prova não usa a arena de Batalha de Equipes.');
  const sides=resolveParticipants(event,state,game.actors),scene=await ensureScene(event,ARENA_MAP,{game,SceneClass});
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

/** Prepara uma cena exclusiva para um duelo, com dois Tokens no círculo central e iniciativa rolada. */
export async function prepareDuelArena(event,{game=globalThis.game,SceneClass,CombatClass,state}={}){
  if(!game.user?.isGM)throw Error('Somente a Mestra pode montar o Anel.');
  if(!event?.duel)throw Error('Esta prova não usa o Duelo do Anel.');
  const duelists=resolveDuelists(event,game.actors);
  for(const actor of duelists)if(actor.hasPlayerOwner&&!state?.memberships?.some(m=>m.actorId===actor.id))throw Error(`${actor.name} precisa se inscrever no Coliseu antes de participar.`);
  const scene=await ensureScene(event,DUEL_MAP,{game,SceneClass});
  const oldTokens=rows(scene.tokens).filter(token=>token.flags?.[ID]?.arena?.eventId===event.id).map(token=>token.id);
  if(oldTokens.length)await scene.deleteEmbeddedDocuments('Token',oldTokens);
  const tokens=await scene.createEmbeddedDocuments('Token',await Promise.all(duelists.map((actor,side)=>tokenSource(actor,{...DUEL_MAP.spawns[side][0],side,eventId:event.id}))));
  const Combat=CombatClass??globalThis.Combat??globalThis.foundry?.documents?.Combat;
  if(!Combat?.create)throw Error('A API de Combates do Foundry não está disponível.');
  const oldCombat=event.duel.combatId&&actorById(game.combats,event.duel.combatId);if(oldCombat)await oldCombat.delete();
  const combat=await Combat.create({name:event.name,scene:scene.id,active:true,flags:{[ID]:{arena:{eventId:event.id}}}});
  const combatants=await combat.createEmbeddedDocuments('Combatant',tokens.map(token=>({tokenId:token.id,actorId:token.actorId,hidden:false,flags:{[ID]:{arena:{eventId:event.id,side:token.flags?.[ID]?.arena?.side}}}})));
  if(combatants.length)await combat.rollInitiative(combatants.map(row=>row.id));
  return {sceneId:scene.id,combatId:combat.id,tokenIds:tokens.map(token=>token.id),participants:duelists.map(actor=>actor.id)};
}

export async function openArena(sceneId,{game=globalThis.game}={}){
  if(!game.user?.isGM)throw Error('Somente a Mestra pode abrir a arena.');
  const scene=actorById(game.scenes,sceneId);if(!scene)throw Error('A cena desta batalha não existe mais.');
  await scene.activate?.();
  await scene.view?.();
  return scene;
}

/** Cria ou abre a cena-modelo privada de uma modalidade, sem Tokens e sem Combate. */
export async function prepareGameScene(gameId,{game=globalThis.game,SceneClass}={}){
  if(!game.user?.isGM)throw Error('Somente a Mestra pode preparar os mapas do Teatro.');
  const config=GAME_MAPS[gameId];if(!config)throw Error('Esta modalidade ainda não possui mapa no Teatro.');
  const existing=rows(game.scenes).find(scene=>scene.flags?.[ID]?.gameScene?.gameId===gameId);
  if(existing)return {sceneId:existing.id,gameId};
  const Source=SceneClass??globalThis.Scene??globalThis.foundry?.documents?.Scene;
  if(!Source?.create)throw Error('A API de Cenas do Foundry não está disponível.');
  const scene=await Source.create({name:config.title,width:config.width,height:config.height,padding:0.1,grid:{type:1,size:config.grid,distance:1,units:'m'},background:{src:config.src},navigation:false,flags:{[ID]:{gameScene:{gameId,notes:config.notes}}}});
  return {sceneId:scene.id,gameId};
}
