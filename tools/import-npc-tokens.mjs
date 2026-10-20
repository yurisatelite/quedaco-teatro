// Copia artes existentes do pack particular do usuário. Não altera os originais.
import {readFile,copyFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {CIRCUIT_NPCS} from '../src/roster.mjs';
const source=process.argv[2]??'E:/RPG/OPATH/Tokens Pack/tokens-skyfall/Humans';
// Escolha editorial por papel e aparência; fichas mecânicas existentes são preservadas.
const selections={
  'vayla-norem':['Female','determined captain'], 'ponto-seis':['Male','hunter middle-aged'],
  'mira-fio':['Female','pale alchemist'], 'gor-brasa':['Male','angry brawler'],
  'tassi-uru':['Female','human female ranger'], 'lama':['Male','lumberjack'],
  'eron-sopro':['Male','khan_s messenger'], 'kika-lodo':['Female','welcoming cleric'],
  'soren-val':['Male','fighter with rapier'], 'nima-vanta':['Female','deer hunter'],
  'rusk-oco':['Male','veteran in plate armor'], 'eli-sombra':['Female','cloaked female with dagger'],
  'yori-m-bo':['Female','human female nomadic'], 'ferro-fino':['Male','human warrior stern'],
  'sia-duna':['Female','traveller with backpack'], 'mauro-varmah':['Male','acolyte young'],
  'dona-belta':['Female','middle-aged woman'], 'nalo-das-cordas':['Male','smirking seafarer'],
  'crisalida':['Female','higher scholar-mage'], 'dente-curto':['Male','young man with bandana'],
  'vo-piri':['Female','old lady smiling'], 'isto-nao-e-meu-nome':['Male','rogue concerned'],
  'galan-risco':['Male','inquisitive scholar'], 'tia-nuvem':['Female','old lady with braid'],
  'par-de-dados':['Male','trickster'], 'sall-vinte':['Male','tired bearded man'],
  'aru-da-lama':['Male','floating bard'], 'mestre-ovido':['Male','elder mystic-scholar'],
  'pequena-rima':['Female','night messenger'], 'coroa-sem-ouro':['Male','innocuous nobleman'],
  'teko-varmah':['Male','hunter with white bear skin'], 'mao-de-cobre':['Male','scoundrel'],
  'rima-de-sal':['Female','historian with glasses'], 'bico-de-ferro':['Male','stern soldier'],
  'hedra-palida':['Female','hooded stern female'], 'santo-remendo':['Male','medic'],
  'vigia-cacto':['Male','human with wolf pup'], 'duas-luzes':['Female','twin diviner 1'],
  'cinta-negra':['Female','cloaked determined human'], 'pai-fosforo':['Male','old human with pipe'],
  'safira-do-odre':['Female','travelling merchant'], 'dara-rebite':['Female','older artificer'],
  'ilen-folha-seca':['Female','human female serene'], 'nilo-dos-ecos':['Male','smiling youth']
};
const hashes=new Set();await mkdir(resolve(import.meta.dirname,'../assets/npc'),{recursive:true});
for(const row of CIRCUIT_NPCS){
  const [folder,name]=selections[row.key]??[];if(!name)throw Error(`Sem imagem para ${row.model.name}`);
  const chosen=`Humans ${folder}/${name}.png`,hash=createHash('sha256').update(await readFile(resolve(source,chosen))).digest('hex');
  if(hashes.has(hash))throw Error(`Imagem repetida: ${chosen}`);hashes.add(hash);
  await copyFile(resolve(source,chosen),resolve(import.meta.dirname,`../assets/npc/${row.key}.png`));
  console.log(`${row.model.name} ← ${chosen}`);
}
console.log(`${hashes.size} imagens distintas copiadas.`);
