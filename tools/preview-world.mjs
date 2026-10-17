// Browser fixture: exercises the real module app/store/main with a minimal Foundry host.
const callbacks=new Map();
globalThis.Hooks={once(name,fn){this.on(name,fn);},on(name,fn){const list=callbacks.get(name)||[];list.push(fn);callbacks.set(name,list);},callAll(name,...args){for(const fn of callbacks.get(name)||[])fn(...args);}};
globalThis.previewErrors=[];
globalThis.ui={notifications:{error:message=>previewErrors.push(message)}};
class App {
  constructor(){this.rendered=false;}
  async render(){this.element=document.querySelector('#preview');this._replaceHTML(await this._renderHTML(),this.element);this.rendered=true;this._onRender({},{});return this;}
  _onRender(){}
  async close(){this.element.replaceChildren();this.rendered=false;return this;}
  bringToFront(){}
}
const create=async record=>{
  const doc={...structuredClone(record),testUserPermission(user){return user.isGM||this.ownership.default>=2;},async update(next){Object.assign(this,structuredClone(next));Hooks.callAll('updateJournalEntry',this);return this;}};
  game.journal.push(doc);Hooks.callAll('createJournalEntry',doc);return doc;
};
globalThis.foundry={applications:{api:{ApplicationV2:App,DialogV2:{confirm:async()=>true}}},documents:{JournalEntry:{create}},dice:{Roll:class {async evaluate(){return {total:1};}}}};
globalThis.game={user:{isGM:true},release:{generation:13},journal:[],modules:new Map([['quedaco-teatro',{version:'0.1.0'}]]),settings:{registerMenu(){}}};
await import('../src/main.mjs');
for(const fn of callbacks.get('init')||[])await fn();
for(const fn of callbacks.get('ready')||[])await fn();
globalThis.previewApp=await game.modules.get('quedaco-teatro').api.openTheatre();
