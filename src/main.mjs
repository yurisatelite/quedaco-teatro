import {ID} from './model.mjs';
import {createStore} from './store.mjs';
import {createTheatreApp} from './app.mjs';
import {connectMembership} from './membership.mjs';
let app,store;
export async function openTheatre() {
  if(!app)throw Error('O Teatro ainda está inicializando.');
  await app.render({force:true});app.bringToFront();return app;
}
Hooks.once('init',()=>{
  class TheatreMenu extends foundry.applications.api.ApplicationV2 {
    render(){void openTheatre().catch(err=>ui.notifications.error(err.message));return this;}
  }
  game.settings.registerMenu(ID,'open',{name:'QT.Title',label:'QT.Menu',hint:'QT.MenuHint',icon:'fa-solid fa-masks-theater',type:TheatreMenu,restricted:false});
});
Hooks.once('ready',async()=>{
  try{
    store=createStore(game,{create:data=>foundry.documents.JournalEntry.create(data),seed:async()=>(await import('./catalog.mjs')).CATALOG});
    if(game.user.isGM){await store.initialize();const leader=Array.from(game.users??[]).filter(u=>u.active&&u.isGM).sort((a,b)=>a.id.localeCompare(b.id))[0];if(!leader||leader.id===game.user.id){const {installVendors}=await import('./vendors.mjs');await store.mutate(s=>installVendors(s));}}
    const App=createTheatreApp(store);app=new App();
    app.sendMemberRequest=connectMembership(store,{game,onChange:()=>{if(app.rendered&&!app.dirty)void app.render({force:true});}});
    const module=game.modules.get(ID);
    module.api={...module.api,family:'quedaco',contractVersion:1,id:ID,version:module.version,
      capabilities:{openTheatre:true,publicPresentation:true},openTheatre,
      getPublicPresentation:()=>store.published(),
      getStatus:()=>({ready:Boolean(app),systemCompatible:Number(game.release.generation)>=13,connections:[]})};
    Hooks.callAll('quedaco:register',module.api);
    // Late joiners can reopen the persisted public cartaz from the module menu.
  }catch(error){console.error(ID,error);ui.notifications.error(error.message);}
});
for(const hook of ['createJournalEntry','updateJournalEntry'])Hooks.on(hook,doc=>{
  if(doc.flags?.[ID]?.role==='publication')void app?.refreshPublication({show:Boolean(doc.flags[ID].publication?.active)}).catch(err=>ui.notifications.error(err.message));
});
Hooks.on('deleteJournalEntry',doc=>{if(doc.flags?.[ID]?.role==='publication')void app?.refreshPublication().catch(err=>ui.notifications.error(err.message));});
Hooks.on('renderJournalDirectory',(_app,element)=>{
  const root=element instanceof HTMLElement?element:element?.[0];
  const header=root?.querySelector('.header-actions')??root?.querySelector('.directory-header');
  if(!header||header.querySelector('[data-qt-open]'))return;
  const button=header.ownerDocument.createElement('button');button.type='button';button.dataset.qtOpen='';button.textContent='Teatro dos Condenados';
  button.addEventListener('click',()=>void openTheatre().catch(err=>ui.notifications.error(err.message)));header.append(button);
});
Hooks.on('getSceneControlButtons',controls=>{
  const tool={name:ID,title:'QT.Title',icon:'fa-solid fa-masks-theater',button:true,order:98,onClick:()=>void openTheatre().catch(err=>ui.notifications.error(err.message))};
  if(Array.isArray(controls))controls.find(c=>c.name==='tokens')?.tools.push(tool);
  else if(controls.tokens?.tools)controls.tokens.tools[ID]=tool;
});

// Atualiza classe e saldo público a partir da ficha real, sem alterar o restante do cartaz.
let memberRefreshTimer;
for(const hook of ['updateActor','createItem','updateItem','deleteItem'])Hooks.on(hook,()=>{
  if(!game.user.isGM||!store)return;
  const leader=Array.from(game.users??[]).filter(u=>u.active&&u.isGM).sort((a,b)=>a.id.localeCompare(b.id))[0];if(leader&&leader.id!==game.user.id)return;
  clearTimeout(memberRefreshTimer);memberRefreshTimer=setTimeout(()=>{void store.refreshMembers().then(()=>{if(app?.rendered&&!app.dirty)return app.render({force:true});}).catch(error=>console.error(ID,error));},300);
});
