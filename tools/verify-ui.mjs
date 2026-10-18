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
    const file=resolve(root,'.'+decodeURIComponent(pathname));if(!file.startsWith(root+sep))throw Error('outside');
    res.setHeader('Content-Type',extname(file)==='.mjs'?'text/javascript; charset=utf-8':'text/css; charset=utf-8');res.end(await readFile(file));
  }catch{res.statusCode=404;res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
  const page=await browser.newPage({viewport:{width:1180,height:950}}),errors=[];
  page.on('pageerror',err=>errors.push(err.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  await page.waitForSelector('[data-qt-action="publish"]');
  const tab=id=>page.click(`[data-qt-action="tab"][data-id="${id}"]`);
  await tab('direction');await page.fill('[name="notes"]','SEGREDO-MESTRE-987');await page.fill('[name="announcement"]','A final começa ao crepúsculo.');await page.click('button[type="submit"]');
  await tab('events');await page.fill('[name="name"]','Final das Dunas');await page.fill('[name="a"]','Escorpiões');await page.fill('[name="b"]','Caravaneiros');await page.fill('[name="reward"]','Uma relíquia');await page.click('button[type="submit"]');await page.waitForSelector('.qt-versus');assert.equal(await page.locator('.qt-arena-preview').count(),1);
  assert.match(await page.locator('#preview').innerText(),/Duelo do Anel|1 contra 1/);
  await tab('bets');await page.fill('[name="bettor"]','Ana');await page.fill('[name="stake"]','100');await page.click('button[type="submit"]');await page.waitForSelector('tbody tr');
  await tab('events');await page.click('[data-qt-action="settle"][data-winner="0"]');await page.waitForSelector('text=Vencedor: Escorpiões');
  await tab('bets');assert.match(await page.locator('tbody').innerText(),/Ganha/);assert.match(await page.locator('tbody').innerText(),/200/);
  await page.click('[data-qt-action="publish"]');
  await tab('overview');await mkdir(resolve(root,'output'),{recursive:true});await page.screenshot({path:resolve(root,'output/mestre.png'),fullPage:true});
  await page.click('[data-qt-action="preview"]');assert.equal(await page.locator('[data-qt-action="publish"]').count(),0);assert.doesNotMatch(await page.locator('#preview').innerText(),/SEGREDO|CAIXA DAS APOSTAS/);
  await page.click('[data-qt-action="preview"]');
  // Hold the GM app and make a separate player app reading only publication documents.
  await page.evaluate(async()=>{globalThis.gmApp=previewApp;game.user={isGM:false};const {createStore}=await import('/src/store.mjs');const {createTheatreApp}=await import('/src/app.mjs');const App=createTheatreApp(createStore(game));previewApp=new App();await previewApp.render();});
  assert.equal(await page.locator('[data-qt-action="publish"]').count(),0);
  assert.match(await page.locator('#preview').innerText(),/A final começa ao crepúsculo/);
  await tab('dossier');await page.click('[data-qt-action="category"][data-id="npc"]');assert.match(await page.locator('#preview').innerText(),/Rask/);assert.doesNotMatch(await page.locator('#preview').innerText(),/Cada vitória apaga|Segredos e condução/);
  await tab('events');assert.match(await page.locator('#preview').innerText(),/Vencedor: Escorpiões/);
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
  console.log('UI OK: direção, espetáculo, aposta, pagamento, publicação, prévia, jogador, retirada e mobile.');
}finally{await browser.close();await new Promise(r=>server.close(r));}
