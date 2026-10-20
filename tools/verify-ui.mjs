import {createServer} from 'node:http';
import {readFile,mkdir} from 'node:fs/promises';
import {resolve,sep,extname} from 'node:path';
import assert from 'node:assert/strict';
const {chromium}=await import('../../quedaco-campanhas/node_modules/playwright/index.mjs');
const root=resolve(import.meta.dirname,'..');
const server=createServer(async(req,res)=>{
  try{
    const pathname=new URL(req.url,'http://localhost').pathname;
    if(pathname==='/'){res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="/styles/teatro.css"><style>body{margin:0;background:#171518}#preview{max-width:1120px;margin:auto}</style></head><body><section id="preview" class="quedaco-teatro"></section><script type="module" src="/tools/preview-world.mjs"></script></body></html>');return;}
    const file=resolve(root,'.'+decodeURIComponent(pathname).replace(/^\/modules\/quedaco-teatro\//,'/'));if(!file.startsWith(root+sep))throw Error('outside');
    res.setHeader('Content-Type',({'.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.svg':'image/svg+xml','.jfif':'image/jpeg'})[extname(file)]||'application/octet-stream');res.end(await readFile(file));
  }catch{res.statusCode=404;res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
  const page=await browser.newPage({viewport:{width:1180,height:950}}),errors=[];page.setDefaultTimeout(5000);
  page.on('pageerror',err=>errors.push(err.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.waitForSelector('[data-qt-action="publish"]');
  await page.click('[data-qt-action="tab"][data-id="games"]');
  assert.equal(await page.locator('.qt-game-grid').first().locator('.qt-game-tile').count(),1);
  assert.equal(await page.locator('.qt-drawer:not([open])').count(),1);
  assert.equal(await page.locator('nav button').last().innerText(),'Dossiê');
  const tab=id=>page.click(`[data-qt-action="tab"][data-id="${id}"]`);
  await page.evaluate(async()=>{
    const {createStore}=await import('/src/store.mjs');const {installCircuit,CIRCUIT_NPCS}=await import('/src/roster.mjs');
    game.actors=CIRCUIT_NPCS.map((r,i)=>({id:`a${i}`,name:r.model.name,type:'character',img:r.model.portrait,items:[],flags:{'quedaco-teatro':{npc:{key:r.key}}},hasPlayerOwner:false,testUserPermission:()=>false}));
    game.actors.get=id=>game.actors.find(a=>a.id===id);
    game.actors.push({id:'monster',name:'Ameaça de teste',type:'npc',items:[],system:{},testUserPermission:()=>false});
    await createStore(game).mutate(s=>installCircuit(s));
  });
  await mkdir(resolve(root,'output'),{recursive:true});
  await tab('teams');assert.equal(await page.locator('.qt-team-tile').count(),5);
  assert.doesNotMatch(await page.locator('main').innerText(),/nenhuma criação pendente|Fama/);
  await page.screenshot({path:resolve(root,'output/equipes.png'),fullPage:true});
  await page.click('.qt-new-team>summary');await page.fill('[data-qt-form="team"] [name="name"]','Equipe Teste');await page.click('[data-qt-form="team"] button[type="submit"]');
  const testTeam=page.locator('.qt-team-tile').filter({has:page.locator('h3',{hasText:'Equipe Teste'})});
  await testTeam.locator(':scope>summary').click();assert.match(await testTeam.innerText(),/Equipe vazia/);
  assert.equal(await testTeam.locator('option[value="monster"]').count(),0);assert.equal(await testTeam.locator('[name="role"]').count(),0);
  await testTeam.locator('[data-qt-form="team-member"] select').selectOption('a43');await testTeam.locator('[data-qt-form="team-member"] button').click();
  await testTeam.locator(':scope>summary').click();assert.match(await testTeam.innerText(),/Nilo dos Ecos/);
  await testTeam.locator('[data-qt-action="remove-member"]').click();await testTeam.locator(':scope>summary').click();assert.match(await testTeam.innerText(),/Equipe vazia/);
  await testTeam.locator('summary',{hasText:'Editar equipe'}).click();await testTeam.locator('[data-qt-action="remove-team"]').click();await testTeam.waitFor({state:'detached'});
  await tab('events');await page.fill('[name="reward"]','Uma relíquia');await page.click('button[type="submit"]');await page.waitForSelector('.qt-matchup');assert.equal(await page.locator('.qt-event-tile').count(),1);
  assert.match(await page.locator('#preview').innerText(),/Duelo do Anel|1 contra 1/);
  await tab('bets');await page.fill('[name="bettor"]','Ana');await page.fill('[name="stake"]','100');await page.click('button[type="submit"]');await page.waitForSelector('tbody tr');
  await tab('events');await page.click('[data-qt-action="lock"]');await page.click('[data-qt-action="simulate-event"]');await page.waitForSelector('.qt-finished:not([open])');await page.click('.qt-finished>summary');await page.waitForSelector('.qt-result');
  await tab('bets');assert.match(await page.locator('tbody').innerText(),/Ganha|Perdida/);
  await page.locator('.qt-drawer>summary').first().click();await page.screenshot({path:resolve(root,'output/apostadores.png'),fullPage:true});
  await page.evaluate(async()=>{
    const {createStore}=await import('/src/store.mjs');const {createCircuitEvent}=await import('/src/circuit.mjs');
    game.actors.push({id:'player',name:'Jogador de teste',type:'character',img:game.actors[0].img,items:[{type:'class',name:'Ocultista'}],hasPlayerOwner:true,system:{currency:{p:250}},testUserPermission:()=>true});
    await createStore(game).mutate(s=>{s.memberships.push({actorId:'player',name:'Jogador de teste',bettor:true});createCircuitEvent(s,{game:'Duelo do Anel'},{actors:game.actors});});
  });
  await tab('my-bets');await page.locator('.qt-drawer>summary').click();await page.click('[data-qt-action="bet-amount"][data-amount="100"]');assert.equal(await page.locator('[data-qt-bet] [name="stake"]').inputValue(),'100');assert.match(await page.locator('[data-qt-return]').innerText(),/200/);
  await page.fill('[data-qt-bet] [name="stake"]','101');assert.equal(await page.locator('[data-qt-bet]').evaluate(form=>form.checkValidity()),false);
  await page.fill('[data-qt-bet] [name="stake"]','20');assert.match(await page.locator('[data-qt-return]').innerText(),/40/);
  await page.screenshot({path:resolve(root,'output/aposta-jogador.png'),fullPage:true});
  await tab('overview');
  await page.click('[data-qt-action="publish"]');
  await tab('overview');await mkdir(resolve(root,'output'),{recursive:true});await page.screenshot({path:resolve(root,'output/mestre.png'),fullPage:true});
  await page.click('[data-qt-action="preview"]');assert.equal(await page.locator('[data-qt-action="publish"]').count(),0);assert.doesNotMatch(await page.locator('#preview').innerText(),/SEGREDO|CAIXA DAS APOSTAS/);
  await page.click('[data-qt-action="preview"]');
  // Hold the GM app and make a separate player app reading only publication documents.
  await page.evaluate(async()=>{globalThis.gmApp=previewApp;game.actors=game.actors.filter(a=>a.id!=='player');game.user={isGM:false};const {createStore}=await import('/src/store.mjs');const {createTheatreApp}=await import('/src/app.mjs');const App=createTheatreApp(createStore(game));previewApp=new App();await previewApp.render();});
  assert.equal(await page.locator('[data-qt-action="publish"]').count(),0);
  assert.match(await page.locator('#preview').innerText(),/As portas do Teatro dos Condenados estão abertas/);
  assert.equal(await page.locator('[data-qt-action="tab"][data-id="dossier"]').count(),0);
  assert.equal(await page.locator('[data-qt-action="tab"][data-id="events"]').count(),0);
  await tab('membership');assert.match(await page.locator('#preview').innerText(),/10 pilas/);
  await page.screenshot({path:resolve(root,'output/jogadores.png'),fullPage:true});
  await page.setViewportSize({width:390,height:850});await page.screenshot({path:resolve(root,'output/jogadores-mobile.png'),fullPage:true});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  // An incoming server document update opens the actual singleton registered by main.mjs.
  await page.evaluate(async()=>{
    await previewApp.close();
    const publication=game.journal.find(d=>d.flags['quedaco-teatro']?.role==='publication');
    const record=structuredClone(publication.flags);
    record['quedaco-teatro'].publication.token='incoming-update';
    await publication.update({flags:record});
  });
  await page.waitForSelector('text=CARTAZ DOS JOGADORES');
  assert.doesNotMatch(await page.locator('#preview').innerText(),/SEGREDO|DIREÇÃO DO MESTRE/);
  // Test automatic publication close through the same method used by Foundry hooks.
  await page.evaluate(async()=>{
    const publication=game.journal.find(d=>d.flags['quedaco-teatro']?.role==='publication');
    await publication.update({flags:{'quedaco-teatro':{role:'publication',publication:{active:false,token:'incoming-close'}}}});
  });
  await page.waitForFunction(()=>document.querySelector('#preview').innerText==='');
  assert.equal(await page.locator('#preview').innerText(),'');
  assert.deepEqual(errors,[]);assert.deepEqual(await page.evaluate(()=>previewErrors),[]);
  await page.evaluate(async()=>{const {CIRCUIT_NPCS}=await import('/src/roster.mjs');document.body.innerHTML='<div id="tokens" style="display:grid;grid-template-columns:repeat(8,1fr);gap:8px;color:white;font:13px sans-serif">'+CIRCUIT_NPCS.map((r,i)=>`<figure style="margin:0;text-align:center"><img width="120" height="120" src="/${r.model.portrait}"><figcaption>${i+1}. ${r.model.name}</figcaption></figure>`).join('')+'</div>';});
  await page.setViewportSize({width:1200,height:1000});await page.locator('#tokens img').last().waitFor();await page.evaluate(()=>Promise.all(Array.from(document.images).map(img=>img.decode())));await page.screenshot({path:resolve(root,'output/tokens.png'),fullPage:true});
  console.log('UI OK: espetáculo, aposta, pagamento, publicação, prévia, jogador, retirada e mobile.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
