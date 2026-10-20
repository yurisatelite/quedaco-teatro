export const ID = 'quedaco-teatro';
export const TITLE = 'QUEDAÇO - O Teatro dos Condenados';
export const ACTIVE_GAME_IDS = new Set(['duelo']);
export const clone = value => structuredClone(value);
export const uid = () => globalThis.crypto.randomUUID().replaceAll('-', '').slice(0, 16);
export const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const money = value => Number(value).toLocaleString('pt-BR', {maximumFractionDigits: 2});
export function amount(value, min = 0) {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > 1e9) throw Error('Valor inválido ou fora do limite.');
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
export function required(value) {
  const text = String(value ?? '').trim();
  if (!text || text.length > 200) throw Error('Preencha um nome com até 200 caracteres.');
  return text;
}
export function initialState(catalog) {
  const entries=clone(catalog).map(row=>row.category==='game'?{...row,revealed:ACTIVE_GAME_IDS.has(row.id)}:row);
  return {schema:5, revision:0, announcement:'As portas do Teatro dos Condenados estão abertas. Nas areias de Kravokia, a próxima lenda pode ser você.', currency:'fichas', crowd:1200, mood:'Expectativa', treasury:0, notes:'', incident:'', entries, events:[], bets:[], teams:[], bettors:[], personnel:[], contracts:[], rosterInstalled:false,gameVisibilityInitialized:true,gameScenes:{}};
}
export function normalizeState(state) {
  state.schema ??= 1; state.events ??= []; state.bets ??= []; state.teams ??= []; state.bettors ??= []; state.personnel ??= []; state.contracts ??= []; state.rosterInstalled ??= false;state.gameScenes??={};state.memberships??=[];state.invitations??=[];state.enrollments??=[];state.memberRequests??=[];
  if(!state.gameVisibilityInitialized){for(const entry of state.entries??[])if(entry.category==='game')entry.revealed=ACTIVE_GAME_IDS.has(entry.id);state.gameVisibilityInitialized=true;}
  // Aplica o foco no Anel também a mundos que já liberavam os quatro portais.
  // Uma única migração permite que o mestre volte a liberar modalidades no futuro.
  if(!state.duelFocusInitialized){for(const entry of state.entries??[])if(entry.category==='game')entry.revealed=entry.id==='duelo';state.duelFocusInitialized=true;}
  for (const team of state.teams) {
    team.members ??= []; team.visible ??= false; team.fame ??= 0; team.sponsor ??= '';
    team.playerTeam ??= Boolean(team.ownerActorId);team.allowPlayers ??= false;
    if(!team.statsInitialized){team.wins??=team.playerTeam?0:Math.floor(Math.random()*9)+2;team.losses??=team.playerTeam?0:Math.floor(Math.random()*5);team.statsInitialized=true;team.narrativeRecord=!team.playerTeam;}
  }
  for (const event of state.events) {
    event.status ??= 'open'; event.visible ??= true; event.winner ??= null;
    if (event.game === 'Batalha de Equipes') {event.battle ??= battleSetup({});event.battle.participants ??=[[],[]];event.battle.sceneId ??='';event.battle.combatId ??='';event.battle.mapId ??='areia-prova';}
    if (event.game === 'Duelo do Anel') {event.duel ??= duelSetup({});event.duel.sceneId ??='';event.duel.combatId ??='';event.duel.mapId ??='anel-areia-negra';}
  }
  state.schema = 5; return state;
}
// Explicit allowlist: never spread private records into public documents.
export function publicState(state) {
  const eventVisible=event=>event.visible&&state.entries.find(row=>row.category==='game'&&row.name===event.game)?.revealed!==false;
  return {
    schema:1, announcement:state.announcement, currency:state.currency,
    crowd:state.crowd, mood:state.mood,
    memberships:(state.memberships??[]).filter(m=>m.player!==false).map(m=>({actorId:m.actorId,name:m.name,img:m.img,role:m.role,bettor:Boolean(m.bettor),...(m.bettor?{cash:m.cash??0}:{})})),
    invitations:(state.invitations??[]).map(i=>({id:i.id,teamId:i.teamId,actorId:i.actorId})),
    enrollments:(state.enrollments??[]).map(i=>({eventId:i.eventId,actorId:i.actorId,name:i.name})),
    bettingActivity:state.bets.filter(b=>b.actorId&&b.eventId&&state.events.some(ev=>ev.id===b.eventId&&eventVisible(ev))).map(b=>({name:b.bettor,actorId:b.actorId,eventId:b.eventId,stake:b.stake,status:b.status})),
    entries:state.entries.filter(e => e.category==='game'&&e.revealed).map(e => ({id:e.id, category:e.category, name:e.name, text:e.text})),
    events:state.events.filter(eventVisible).map(e => ({id:e.id, name:e.name, game:e.game, sides:[...e.sides], terrain:e.terrain, reward:e.reward, status:e.status, winner:e.winner, odds:[...e.odds],mode:e.mode,lineup:e.lineup?.map(side=>side.map(m=>({actorId:m.actorId,name:m.name,img:m.img,role:m.role}))),result:e.result?{winner:e.result.winner,score:[...e.result.score],reason:e.result.reason,draw:e.result.draw,total:e.result.total,weights:[...e.result.weights]}:null, battle:e.battle ? publicBattle(e.battle) : null, duel:e.duel ? publicDuel(e.duel) : null})),
    playerBets:state.bets.filter(b=>b.actorId).map(b=>({id:b.id,actorId:b.actorId,eventId:b.eventId,side:b.side,stake:b.stake,status:b.status,payout:b.payout,claimed:Boolean(b.claimed)})),
    teams:state.teams.filter(t => t.visible).map(t => ({id:t.id,name:t.name,sponsor:t.sponsor,wins:t.wins??0,losses:t.losses??0,playerTeam:Boolean(t.playerTeam),allowPlayers:Boolean(t.allowPlayers),ownerActorId:t.ownerActorId??'',open:Boolean(t.open),members:(t.members ?? []).map(m => ({actorId:m.actorId,name:m.name,img:m.img,role:m.role}))}))
  };
}
const choices = new Set(['objetivos','eliminação','rendição','tempo']);
const deathPolicies = new Set(['permitida','proibida','acidental']);
export function battleSetup(input) {
  const condition = choices.has(input.condition) ? input.condition : 'objetivos';
  const deaths = deathPolicies.has(input.deaths) ? input.deaths : 'permitida';
  const target = amount(input.target ?? 3, 1);
  if (!Number.isInteger(target) || target > 20) throw Error('O alvo da batalha deve ser um inteiro entre 1 e 20.');
  const participants=[0,1].map(side=>Array.from(input[`side${side}ActorIds`]??[]).map(String).filter(Boolean).slice(0,3));
  return {format:required(input.format || '3 contra 3'),condition,deaths,target,roundLimit:amount(input.roundLimit ?? 6, 1),medics:input.medics !== 'no',rules:String(input.rules ?? ''),score:[0,0],deathsCount:[0,0],phase:'scheduled',log:[],participants,sceneId:'',combatId:'',mapId:'areia-prova'};
}
export function publicBattle(battle) { return {format:battle.format,condition:battle.condition,deaths:battle.deaths,target:battle.target,roundLimit:battle.roundLimit,medics:battle.medics,score:[...battle.score],deathsCount:[...battle.deathsCount],phase:battle.phase}; }
const duelVictories = new Set(['rendição','desarme','incapacidade','pontos','tempo']);
const duelMagic = new Set(['permitida','proibida','limitada']);
const duelWeapons = new Set(['livre','sorteada','desarmado']);
const duelRingOut = new Set(['advertência','ponto','derrota']);
export function duelSetup(input) {
  const victory=duelVictories.has(input.duelVictory) ? input.duelVictory : 'rendição';
  const magic=duelMagic.has(input.duelMagic) ? input.duelMagic : 'permitida';
  const weapons=duelWeapons.has(input.duelWeapons) ? input.duelWeapons : 'livre';
  const ringOut=duelRingOut.has(input.ringOut) ? input.ringOut : 'advertência';
  const target=amount(input.duelTarget ?? 3,1);
  if(!Number.isInteger(target)||target>20)throw Error('O alvo do duelo deve ser um inteiro entre 1 e 20.');
  return {format:'1 contra 1',victory,magic,weapons,ringOut,deaths:deathPolicies.has(input.duelDeaths)?input.duelDeaths:'proibida',target,roundLimit:amount(input.duelRoundLimit ?? 5,1),medics:input.duelMedics!=='no',rules:String(input.duelRules ?? ''),score:[0,0],ringOuts:[0,0],phase:'scheduled',log:[],participants:[String(input.duelSide0ActorId??''),String(input.duelSide1ActorId??'')],sceneId:'',combatId:'',mapId:'anel-areia-negra'};
}
export function publicDuel(duel) {return {format:duel.format,victory:duel.victory,magic:duel.magic,weapons:duel.weapons,ringOut:duel.ringOut,deaths:duel.deaths,target:duel.target,roundLimit:duel.roundLimit,medics:duel.medics,score:[...duel.score],ringOuts:[...duel.ringOuts],phase:duel.phase};}
export function addEvent(state, input, id = uid()) {
  const game=String(input.game);
  const presets = game === 'Duelo do Anel'
    ? {terrain:'Anel de areia negra',reward:'60 pilas + direito de escolher a próxima arma',odds:[2,2]}
    : {terrain:'Arena das bandeiras',reward:'120 pilas + tratamento completo para a equipe',odds:[1.8,2.2]};
  const number = String(state.events.length + 1).padStart(6,'0');
  const name = required(input.name || `${game} · ${number}`), sides = [required(input.a || 'Lado A'), required(input.b || 'Lado B')];
  if (sides[0].toLowerCase() === sides[1].toLowerCase()) throw Error('Os lados precisam ter nomes diferentes.');
  const odds = [amount(input.oddsA ?? presets.odds[0], 1), amount(input.oddsB ?? presets.odds[1], 1)];
  state.events.push({id,name,game,sides,teamIds:[String(input.teamA ?? ''),String(input.teamB ?? '')],odds,terrain:String(input.terrain || presets.terrain),reward:String(input.reward || presets.reward),visible:true,status:'open',winner:null,battle:game === 'Batalha de Equipes' ? battleSetup(input) : null,duel:game === 'Duelo do Anel' ? duelSetup(input) : null});
}
export function addBettor(state, input, id = uid()) {
  const bankroll=amount(input.bankroll,0), debt=amount(input.debt,0);
  state.bettors.push({id,name:required(input.name),origin:required(input.origin),purpose:required(input.purpose),style:required(input.style || 'Prudente'),bankroll,debt,actorId:String(input.actorId ?? ''),notes:String(input.notes ?? '')});
}
export function placeBet(state, input, id = uid()) {
  const event = state.events.find(e => e.id === input.eventId);
  if (!event || event.status !== 'open') throw Error('Apostas encerradas ou espetáculo indisponível.');
  const side = Number(input.side);
  if (![0,1].includes(side)) throw Error('Escolha um lado válido.');
  const stake = amount(input.stake, 0.01), bettorId=String(input.bettorId ?? '');
  const bettor=bettorId ? state.bettors.find(b=>b.id===bettorId) : null;
  if (bettor && bettor.bankroll < stake) throw Error(`${bettor.name} não possui fichas suficientes para essa aposta.`);
  if (bettor) bettor.bankroll=amount(bettor.bankroll-stake);
  state.bets.push({id,eventId:event.id,bettorId:bettor?.id ?? '',bettor:bettor?.name ?? required(input.bettor),side,stake,odds:event.odds[side],status:'pending',payout:0});
  state.treasury = amount(state.treasury + stake, -1e9);
}
export function settleEvent(state, eventId, winner) {
  const event = state.events.find(e => e.id === eventId);
  if (!event || !['open','closed','live'].includes(event.status)) throw Error('Espetáculo já encerrado ou indisponível.');
  if (![0,1,'void'].includes(winner)) throw Error('Resultado inválido.');
  event.status = winner === 'void' ? 'void' : 'settled';
  event.winner = winner;
  if(winner!=='void'&&event.teamIds?.[0]!==event.teamIds?.[1])for(let side=0;side<2;side++){const team=state.teams.find(t=>t.id===event.teamIds?.[side]);if(team){const key=side===winner?'wins':'losses';team[key]=Number(team[key]??0)+1;}}
  for (const bet of state.bets.filter(b => b.eventId === eventId && b.status === 'pending')) {
    bet.payout = winner === 'void' ? bet.stake : bet.side === winner ? amount(bet.stake * bet.odds) : 0;
    bet.status = winner === 'void' ? 'refunded' : bet.payout ? 'won' : 'lost';
    const bettor=bet.bettorId && state.bettors.find(b=>b.id===bet.bettorId);
    if (bettor) bettor.bankroll=amount(bettor.bankroll+bet.payout);
    state.treasury = amount(state.treasury - bet.payout, -1e9);
  }
}
export function startBattle(state,eventId) {
  const event=state.events.find(e=>e.id===eventId); if(!event?.battle) throw Error('Esta não é uma Batalha de Equipes.');
  if (!['open','closed'].includes(event.status)) throw Error('A batalha não pode mais começar.');
  event.status='live';event.battle.phase='live';
}
export function recordBattle(state,eventId,side,kind,note='') {
  const event=state.events.find(e=>e.id===eventId), battle=event?.battle;
  if(!battle||event.status!=='live')throw Error('A batalha ainda não está em andamento.');
  side=Number(side);if(![0,1].includes(side))throw Error('Equipe inválida.');
  if(kind==='point')battle.score[side]++;
  else if(kind==='death') {if(battle.deaths==='proibida')throw Error('Mortes são proibidas nesta prova.');battle.deathsCount[side]++;}
  else throw Error('Registro de batalha inválido.');
  battle.log.push({id:uid(),side,kind,note:String(note).slice(0,240)});
  const other=side===0?1:0;
  if ((battle.condition==='objetivos'&&battle.score[side]>=battle.target) || (battle.condition==='eliminação'&&battle.deathsCount[other]>=battle.target)) settleEvent(state,eventId,side);
}
export function startDuel(state,eventId) {
  const event=state.events.find(e=>e.id===eventId);if(!event?.duel)throw Error('Esta não é uma prova de Duelo do Anel.');
  if(!['open','closed'].includes(event.status))throw Error('O duelo não pode mais começar.');
  event.status='live';event.duel.phase='live';
}
export function recordDuel(state,eventId,side,kind,note='') {
  const event=state.events.find(e=>e.id===eventId),duel=event?.duel;
  if(!duel||event.status!=='live')throw Error('O duelo ainda não está em andamento.');
  side=Number(side);if(![0,1].includes(side))throw Error('Duelista inválido.');
  const other=side===0?1:0;
  if(kind==='point') {duel.score[side]++;if(duel.victory==='pontos'&&duel.score[side]>=duel.target)settleEvent(state,eventId,side);}
  else if(kind==='ring-out') {duel.ringOuts[side]++;if(duel.ringOut==='ponto'){duel.score[other]++;if(duel.victory==='pontos'&&duel.score[other]>=duel.target)settleEvent(state,eventId,other);}if(duel.ringOut==='derrota')settleEvent(state,eventId,other);}
  else if(['rendição','desarme','incapacidade'].includes(kind)) {if(duel.victory!==kind)throw Error(`A vitória desta prova é por ${duel.victory}.`);settleEvent(state,eventId,side);}
  else throw Error('Registro de duelo inválido.');
  duel.log.push({id:uid(),side,kind,note:String(note).slice(0,240)});
}
export const reputation = fame => fame >= 20 ? 'Lenda' : fame >= 12 ? 'Ídolo do deserto' : fame >= 6 ? 'Campeão local' : fame >= 2 ? 'Promessa' : 'Desconhecido';
