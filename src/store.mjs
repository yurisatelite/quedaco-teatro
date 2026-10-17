import {ID, TITLE, clone, initialState, publicState, uid} from './model.mjs';
export function createStore(game, {create, seed, uuid=uid} = {}) {
  let queue = Promise.resolve();
  const serial = fn => {const result=queue.then(fn); queue=result.catch(()=>{}); return result;};
  const data = doc => doc?.flags?.[ID];
  const find = role => Array.from(game.journal).find(doc => data(doc)?.role===role && doc.testUserPermission(game.user,'OBSERVER'));
  const gm = () => {if (!game.user.isGM) throw Error('Somente o mestre pode alterar o Teatro.');};
  const write = (doc, role, payload, visible) => {
    const record={name:TITLE+(role==='source'?' · Direção':' · Cartaz'),ownership:{default:visible?2:0},flags:{[ID]:{role,...payload}}};
    return doc ? doc.update(record,{diff:false,recursive:false}) : create(record);
  };
  return {
    async initialize() {gm(); return serial(async()=>{if(!find('source'))await write(null,'source',{state:initialState(await seed())},false);});},
    read() {gm(); const state=data(find('source'))?.state; if(!state)throw Error('Inicialize o Teatro com uma conta de mestre.'); return clone(state);},
    published() {const value=data(find('publication'))?.publication; return value?.active ? clone(value) : null;},
    async mutate(fn, expectedRevision) {
      gm(); return serial(async()=>{
        const doc=find('source'), state=clone(data(doc)?.state);
        if(!state)throw Error('Direção indisponível.');
        if(expectedRevision!==undefined && state.revision!==expectedRevision)throw Error('Os dados mudaram. Atualize a janela antes de salvar.');
        await fn(state); state.revision++;
        await write(doc,'source',{state},false); return clone(state);
      });
    },
    async publish() {
      gm(); return serial(async()=>{
        const state=data(find('source'))?.state;
        if(!state)throw Error('Direção indisponível.');
        const publication={active:true,token:uuid(),sourceRevision:state.revision,...publicState(state)};
        await write(find('publication'),'publication',{publication},true);
        return clone(publication);
      });
    },
    async withdraw() {
      gm(); return serial(async()=>{
        const doc=find('publication');
        // Keep an accessible tombstone so every connected player receives the close signal.
        if(doc)await write(doc,'publication',{publication:{active:false,token:uuid()}},true);
      });
    }
  };
}
