export const ID = 'quedaco-teatro';
export const TITLE = 'QUEDAÇO - O Teatro dos Condenados';
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
  return {schema:1, revision:0, announcement:'As portas do Teatro dos Condenados estão abertas. Nas areias de Kravokia, a próxima lenda pode ser você.', currency:'fichas', crowd:1200, mood:'Expectativa', treasury:0, notes:'', incident:'', entries:clone(catalog), events:[], bets:[], teams:[], contracts:[]};
}
// Explicit allowlist: never spread private records into public documents.
export function publicState(state) {
  return {
    schema:1, announcement:state.announcement, currency:state.currency,
    crowd:state.crowd, mood:state.mood,
    entries:state.entries.filter(e => e.revealed).map(e => ({id:e.id, category:e.category, name:e.name, text:e.text})),
    events:state.events.filter(e => e.visible).map(e => ({id:e.id, name:e.name, game:e.game, sides:[...e.sides], terrain:e.terrain, reward:e.reward, status:e.status, winner:e.winner, odds:[...e.odds]})),
    teams:state.teams.filter(t => t.visible).map(t => ({id:t.id, name:t.name, fame:t.fame}))
  };
}
export function addEvent(state, input, id = uid()) {
  const name = required(input.name), sides = [required(input.a), required(input.b)];
  if (sides[0].toLowerCase() === sides[1].toLowerCase()) throw Error('Os lados precisam ter nomes diferentes.');
  const odds = [amount(input.oddsA, 1), amount(input.oddsB, 1)];
  state.events.push({id,name,game:String(input.game),sides,odds,terrain:String(input.terrain ?? ''),reward:String(input.reward ?? ''),visible:true,status:'open',winner:null});
}
export function placeBet(state, input, id = uid()) {
  const event = state.events.find(e => e.id === input.eventId);
  if (!event || event.status !== 'open') throw Error('Apostas encerradas ou espetáculo indisponível.');
  const side = Number(input.side);
  if (![0,1].includes(side)) throw Error('Escolha um lado válido.');
  const stake = amount(input.stake, 0.01);
  state.bets.push({id,eventId:event.id,bettor:required(input.bettor),side,stake,odds:event.odds[side],status:'pending',payout:0});
  state.treasury = amount(state.treasury + stake, -1e9);
}
export function settleEvent(state, eventId, winner) {
  const event = state.events.find(e => e.id === eventId);
  if (!event || !['open','closed'].includes(event.status)) throw Error('Espetáculo já encerrado ou indisponível.');
  if (![0,1,'void'].includes(winner)) throw Error('Resultado inválido.');
  event.status = winner === 'void' ? 'void' : 'settled';
  event.winner = winner;
  for (const bet of state.bets.filter(b => b.eventId === eventId && b.status === 'pending')) {
    bet.payout = winner === 'void' ? bet.stake : bet.side === winner ? amount(bet.stake * bet.odds) : 0;
    bet.status = winner === 'void' ? 'refunded' : bet.payout ? 'won' : 'lost';
    state.treasury = amount(state.treasury - bet.payout, -1e9);
  }
}
export const reputation = fame => fame >= 20 ? 'Lenda' : fame >= 12 ? 'Ídolo do deserto' : fame >= 6 ? 'Campeão local' : fame >= 2 ? 'Promessa' : 'Desconhecido';
