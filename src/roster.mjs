import {clone, uid} from './model.mjs';

export const CREATOR_ID='quedaco-personagens-skyfall-rpg';
const slug=value=>String(value).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const NPC_PORTRAIT='modules/quedaco-teatro/assets/npc/teatro-portrait-arena.png';
const NPC_TOKEN=NPC_PORTRAIT;
export const npcKey=name=>slug(name);

// Conteúdo autoral pronto para mesa. As fichas são geradas pelo Criador de
// Personagens usando os nomes reais dos compêndios e o contrato QUEDAÇO v1.
export const CIRCUIT_TEAMS = [
  {name:'Dunas de Vidro',sponsor:'Casa Ravel',fame:7,visible:true,identity:'Equipe técnica e metódica. Vence por controle de espaço, escudo e objetivo.',members:[
    ['Vayla Norem','Capitã / escudo','Ex-guarda de caravana; luta para comprar a liberdade da irmã.'],
    ['Ponto-Seis','Batedor','Persegue a própria fama depois de sobreviver a uma Queda.'],
    ['Mira Fio','Controle','Alquimista que mede cada golpe como um experimento.'],
    ['Gor Brasa','Quebra-linha','Carregador de pedreira que quer provar que não é só força bruta.'] ]},
  {name:'Filhos do Atoleiro',sponsor:'Nenhum',fame:4,visible:true,identity:'Improvisadores vindos das rotas alagadas. Usam iscas, cordas e terreno instável.',members:[
    ['Tassi Uru','Capitã / armadilhas','Perdeu o mapa da família para um agiota e quer resgatá-lo.'],
    ['Lama','Grappler','Fala pouco; protege os membros mais jovens da equipe.'],
    ['Eron Sopro','Batedor','Mensageiro que aposta no próprio time para financiar uma fuga.'],
    ['Kika Lodo','Médica de campo','Aceitou a arena para pagar tratamento de uma comunidade doente.'] ]},
  {name:'Lâminas do Crepúsculo',sponsor:'Oficina Vesper',fame:10,visible:true,identity:'Equipe de Kravokia com uniforme impecável, fama cara e rivalidade interna.',members:[
    ['Soren Val','Capitão / duelista','Herdeiro sem herança; precisa de vitórias para manter o patrocínio.'],
    ['Nima Vanta','Atiradora','Quer descobrir quem sabotou sua antiga companhia.'],
    ['Rusk Oco','Defensor','Usa uma prótese alquímica e teme que a Oficina cobre a conta.'],
    ['Eli Sombra','Infiltradora','Compete para vigiar Soren, não para vencer.'] ]},
  {name:'Quebravento',sponsor:'Caravana de Yara M’bo',fame:6,visible:true,identity:'Escolta de deserto que transforma sobrevivência em esporte. Nunca abandona integrante caído.',members:[
    ['Yori M’bo','Capitã / navegação','Defende as rotas de água e odeia a política dos camarotes.'],
    ['Ferro-Fino','Piqueiro','Ex-apostador que trabalha para quitar uma dívida honesta.'],
    ['Sia Duna','Corredora','Caçadora de relíquias que busca a pista de uma ruína perdida.'],
    ['Mauro Varmah','Reservista / magias','Recusou um contrato de laboratório e agora é perseguido.'] ]}
];

export const CIRCUIT_BETTORS = [
  ['Dona Belta','Kravokia','Recuperar o dinheiro que o filho deixou como garantia','Prudente',240,0,'Dona de pensão; conhece todo mundo que chega tarde.'],
  ['Nalo das Cordas','Caravana do oeste','Pagar uma passagem segura antes da próxima tempestade','Informado',90,40,'Correio de caravana; compra notícias antes de comprar bilhetes.'],
  ['Crisálida','Oficinas subterrâneas','Descobrir qual lutador suporta o novo estimulante','Lavador de dinheiro',600,0,'Representante de laboratório; nunca revela quem a contratou.'],
  ['Dente Curto','Dunas de Mirmir','Vingar a derrota do irmão sem entrar na arena','Impulsivo',35,0,'Jovem de arquibancada que confunde torcida com justiça.'],
  ['Vó Piri','Mercado dos Espectadores','Juntar para abrir uma banca própria','Prudente',120,15,'Vendedora de chá que percebe blefes antes dos corretores.'],
  ['Isto Não É Meu Nome','Kravokia','Apagar o próprio contrato de dívida','Desesperado',18,320,'Devedor que troca nomes falsos por noites seguras.'],
  ['Galan Risco','Wam’Mawina','Financiar a busca por uma pessoa desaparecida','Informado',310,0,'Pesquisador que enxerga padrões demais nas cotações.'],
  ['Tia Nuvem','Montanhas do sul','Comprar remédios para o ninho da família','Prudente',70,0,'Viajante de passagem; não entende as intrigas locais.'],
  ['Par de Dados','Sem residência fixa','Vender resultados falsos para os dois lados','Lavador de dinheiro',480,180,'Dupla inseparável; um distrai, o outro anota.'],
  ['Sall Vinte','Kravokia','Ganhar o suficiente para sair da Casa das Apostas','Desesperado',12,610,'Cobrador que começou a apostar nos próprios devedores.'],
  ['Aru da Lama','Atoleiro de Kramboso','Levar dinheiro e histórias de volta para casa','Impulsivo',55,0,'Artista de rua que torce por qualquer azarão.'],
  ['Mestre Ovido','Universidade Arcana','Testar uma teoria sobre coincidência e memória','Informado',850,0,'Erudito rico que registra cada lance em cartões perfurados.'],
  ['Pequena Rima','Portões da Glória','Pagar a multa do pai preso','Desesperado',9,80,'Mensageira adolescente; precisa de proteção, não de conselho moral.'],
  ['Coroa Sem Ouro','Camarote nobre','Forçar uma família rival a perder prestígio','Lavador de dinheiro',1200,0,'Nobre incógnito; aposta para produzir escândalo.'],
  ['Teko Varmah','Deserto central','Comprar água para um acampamento móvel','Prudente',160,0,'Guia que só entra no Coliseu quando a rota está ruim.'],
  ['Mão de Cobre','Dutos de Kravokia','Quitar uma cobrança antes que vire serviço forçado','Desesperado',26,260,'Contrabandista pequeno que conhece saídas de emergência.']
];

export const CIRCUIT_PERSONNEL = [
  ['Rima de Sal','Corretora','Organiza filas de apostas; cobra taxa para explicar as letras miúdas.','Ela sabe qual livro-caixa foi adulterado.'],
  ['Bico de Ferro','Segurança','Revista armas e impede brigas nas arquibancadas.','Recebe ordens conflitantes da Casa e de uma família nobre.'],
  ['Hedra Pálida','Escrivã de contratos','Transforma promessas em documentos que ninguém lê até tarde demais.','Uma cláusula antiga pode libertar vários devedores.'],
  ['Santo Remendo','Médico auxiliar','Atende os feridos quando Namar não está presente.','Desvia parte dos remédios para uma enfermaria comunitária.'],
  ['Vigia Cacto','Tratador','Cuida de montarias e criaturas usadas nas provas.','Uma criatura inteligente pede ajuda toda noite.'],
  ['Duas Luzes','Ajudantes das Arautas','Coletam reações e rumores da multidão.','Uma delas vende previsão falsa; a outra tenta impedir a fraude.'],
  ['Cinta Negra','Cobradora','Executa contratos vencidos sem levantar a voz.','Tem uma lista de dívidas que se recusa a cobrar.'],
  ['Pai Fósforo','Porteiro de túneis','Controla quem chega aos vestiários e à enfermaria.','Perdeu um filho nas Ruínas Inferiores e nunca saiu de lá de verdade.']
];

const PERSONNEL_PROPS={
  'Rima de Sal':['livro-caixa dobrável, sinete de cera e três fichas de cortesia','Conta os apostadores pelo modo como seguram a caneca e guarda cópias de cada recibo.'],
  'Bico de Ferro':['apito de aço, luvas de revista e placa de turno','Faz três voltas curtas pela arquibancada antes de abrir os portões e observa mais as mãos do que os rostos.'],
  'Hedra Pálida':['estojo de pena, carvão de cópia e contratos em branco','Trabalha à luz baixa, lê cada cláusula em voz neutra e só então pergunta se alguém quer desistir.'],
  'Santo Remendo':['bolsa de sutura, ataduras limpas e medalhão de enfermaria','Dorme em bancos perto da enfermaria e conhece a história de cada cicatriz que trata.'],
  'Vigia Cacto':['chaves de curral, ração seca e sino de montaria','Chega antes do sol, conversa com as criaturas e nunca aceita que as chamem de equipamento.'],
  'Duas Luzes':['duas lanternas coloridas, cartões de rumor e giz','Trocam sinais de luz durante a luta; uma anota boatos, a outra confere se alguém está plantando mentira.'],
  'Cinta Negra':['pasta de cobrança, fita preta e recibos quitados','Visita devedores no começo da manhã, oferece uma saída possível e só ameaça quando já não há testemunhas.'],
  'Pai Fósforo':['chaveiro de túneis, caixas de fósforo e mapa queimado','Acende uma chama em cada entrada antes do espetáculo e conversa com ausências como se ainda respondessem.']
};

const BETTOR_PROPS={
  'Dona Belta':['chave da pensão, chaleira de cobre e caderneta de hóspedes','Fica perto das saídas, serve chá para ouvir conversas e só arrisca quando conhece a família do competidor.'],
  'Nalo das Cordas':['rolo de corda fina, mapa de rotas e bilhetes de recado','Chega coberto de poeira, troca novidades por água e calcula a aposta como quem calcula uma travessia.'],
  'Crisálida':['frasco lacrado, luvas de oficina e convite sem assinatura','Observa pulsos e pupilas mais do que a luta; nunca bebe o que manda os outros provarem.'],
  'Dente Curto':['faixa de torcida, canivete sem fio e retrato do irmão','Grita demais, perde a conta das moedas e se torna perigoso quando alguém ri da derrota do irmão.'],
  'Vó Piri':['bule de barro, sachês de erva e moedas separadas por pano','Monta a banca cedo, escuta sem interromper e identifica um blefe antes da primeira cotação.'],
  'Isto Não É Meu Nome':['três documentos falsos, capa reversível e metade de um contrato','Muda de mesa toda rodada e escolhe lugares onde pode ver a porta e o caixa ao mesmo tempo.'],
  'Galan Risco':['cartões perfurados, lente de aumento e retrato desbotado','Marca resultados em padrões obsessivos e interrompe a escrita apenas quando algum nome desaparecido é citado.'],
  'Tia Nuvem':['cesta de remédios, manta de viagem e lista de compras','Está só de passagem, pergunta demais sobre preços e não percebe quando a torcida tenta puxá-la para uma briga.'],
  'Par de Dados':['dois dados viciados, paletós combinando e livreto de boatos','Um conversa alto para formar plateia; o outro registra tudo e some antes de qualquer acerto.'],
  'Sall Vinte':['fichário de dívidas, calculadora de contas e bebida barata','Conhece as taxas da Casa melhor que as próprias chances e fica pálido quando um cliente antigo se aproxima.'],
  'Aru da Lama':['tambor de mão, tintas de rosto e saco de moedas pequenas','Transforma qualquer espera em música, torce por azarões e acaba sabendo de histórias que ninguém contou de propósito.'],
  'Mestre Ovido':['luneta, cartões numerados e estojo de escrita','Anota cada repetição como experimento e trata uma vitória improvável como prova de que a memória pode ser torcida.'],
  'Pequena Rima':['bolsa de mensageira, sandálias gastas e carta para o pai','Corre entre filas com recados, evita adultos que perguntam demais e só aposta quando acredita que ninguém verá.'],
  'Coroa Sem Ouro':['máscara simples, anel de família e bolsa pesada','Prefere camarotes escuros, manda criados apostarem em seu lugar e mede prestígio como outros medem sangue.'],
  'Teko Varmah':['odre de água, bússola de areia e mapa do acampamento','Confere o céu antes de escolher um palpite e abandona o Coliseu sem aviso se a rota de seu povo precisar dele.'],
  'Mão de Cobre':['luvas manchadas, chave de duto e pacote embrulhado','Senta perto de passagens de serviço, fala baixo e reconhece guardas pela sola das botas.']
};

const COMPETITOR_PROPS={
  'Vayla Norem':['escudo de treino marcado, retrato da irmã e cinto de guarda','Revisa a formação antes de cada entrada e conta vitórias como parcelas de uma libertação.'],
  'Ponto-Seis':['bússola quebrada, lenço da Queda e fichas de fama','Chega cedo para medir vento e plateia; ri alto para não deixar ninguém perceber que teme sobreviver de novo.'],
  'Mira Fio':['caderno de fórmulas, frascos vazios e pinça de cobre','Observa o alcance de todo golpe, registra desvios e trata a arena como laboratório com testemunhas demais.'],
  'Gor Brasa':['luvas de pedreira, pedra lisa e porção extra de comida','Aquece em silêncio, carrega o peso dos colegas e odeia quando alguém chama sua gentileza de fraqueza.'],
  'Tassi Uru':['mapa rasgado, anzóis de corda e medalha da família','Testa cada nó antes do combate e repete os caminhos do mapa de memória para não esquecer o que lhe tomaram.'],
  'Lama':['faixas de agarramento, pedra de rio e prato de madeira','Fala pouco, come por último e se coloca entre o perigo e qualquer integrante que pareça jovem demais para estar ali.'],
  'Eron Sopro':['tubo de mensagens, capa leve e moeda de fuga','Some pelos corredores depois das lutas, calcula rotas de saída e aposta no time como quem compra tempo.'],
  'Kika Lodo':['bolsa médica, ervas secas e lista de pacientes','Confere a enfermaria antes de vestir as luvas; vence rápido porque toda demora custa alguém fora da arena.'],
  'Soren Val':['lâmina cerimonial, brasão partido e luvas impecáveis','Ensaiou entradas para a nobreza, mas treina sozinho quando a oficina fecha e ninguém está aplaudindo.'],
  'Nima Vanta':['luneta de mira, estojo de munição e emblema queimado','Conta passos e ângulos do alto, mantendo um olho no alvo e outro em quem pode ter sabotado seu passado.'],
  'Rusk Oco':['prótese de manutenção, chave de ajuste e recibos da Oficina','Aperta parafusos antes da luta e guarda cada comprovante como prova de que ainda não pertence a ninguém.'],
  'Eli Sombra':['corda escura, máscara lisa e bilhete codificado','Chega por rotas que ninguém vê, observa Soren mais que os adversários e evita responder perguntas sobre patrocinadores.'],
  'Yori M’bo':['bússola de rota, odre compartilhado e lenço da caravana','Confere água e saídas antes de aceitar qualquer prova; sua capitânia começa protegendo quem não consegue correr.'],
  'Ferro-Fino':['lança de treino, recibo dobrado e medalha de honestidade','Mantém distância precisa e paga uma pequena parte da dívida depois de cada luta, mesmo quando ninguém exige.'],
  'Sia Duna':['gancho de escalada, fragmento de ruína e botas de corrida','Reconhece terreno como quem lê um mapa e pergunta demais sobre qualquer pedra que pareça antiga.'],
  'Mauro Varmah':['foco de estudo, caderno queimado e carta recusada','Pratica gestos discretos nos túneis, olha por cima do ombro ao ouvir passos e recusa falar da proposta do laboratório.']
};

function template({key,name,job,appearance,clothes,behavior,voice,routine,desire,fear,secret,hook,tactics,possessions,cash,relations=[]}){
  // O contrato do Criador exige uma lista: biografia usa join e inventário itera cada pertence.
  possessions=Array.isArray(possessions)?[...possessions]:String(possessions??'').split(/,\s*|\s+e\s+/).map(item=>item.trim()).filter(Boolean);
  // Anuro/Bufonin, Combatente e Militar são entradas verificadas pelo Criador.
  // A preparação ainda consulta os compêndios instalados antes de gravar a ficha.
  return {id:`teatro:${key}`,name,portrait:NPC_PORTRAIT,token:NPC_TOKEN,level:1,cash,legacy:'Anuro',heritage:'Bufonin',characterClass:'Combatente',background:'Militar',attributes:{str:1,dex:1,con:1,int:0,wis:1,cha:0},inventory:[],possessions,skillPriority:['athletics','perception'],languagePriority:[],featPriority:['Combate com uma arma','Façanha com uma arma','Ataque Poderoso'],relations,job,appearance,clothes,behavior,voice,routine,desire,fear,secret,hook,tactics};
}

/** Modelos detalhados, idempotentes e prontos para a API do Criador. */
export const CIRCUIT_NPCS=Object.freeze([
  ...CIRCUIT_TEAMS.flatMap(team=>team.members.map(([name,role,bio])=>{
    const [possessions,routine]=COMPETITOR_PROPS[name];const key=npcKey(name);
    return {key,kind:'competitor',teamName:team.name,role,model:template({key,name,job:`Competidor do Teatro · ${role}`,appearance:`Atleta de arena com marcas de areia e a postura de quem aprendeu a dormir em viagem. ${bio}`,clothes:`Uniforme de ${team.name}, adaptado sobre roupa de combate simples; cores do patrocinador ${team.sponsor}.`,behavior:'Disciplina o medo em trabalho de equipe e prefere uma vitória que deixe aliados vivos.',voice:'Fala direto, com frases curtas; a tensão aparece quando o assunto é dívida ou família.',routine,desire:bio,fear:'Ser transformado em espetáculo descartável pela Casa ou perder alguém por uma decisão tomada na arena.',secret:`${bio} Há uma segunda camada dessa urgência que o competidor só revela quando a confiança é merecida.`,hook:`Uma aposta, um contrato ou um rival pode pressionar ${name} antes da próxima luta.`,tactics:`${role}. Prioriza objetivos, cobertura e retirada de aliados; só aceita risco fatal se a regra da prova exigir.`,possessions,cash:35})};
  })),
  ...CIRCUIT_BETTORS.map(([name,origin,purpose,style,bankroll,debt,notes])=>{
    const [possessions,routine]=BETTOR_PROPS[name];const key=npcKey(name);
    return {key,kind:'bettor',style,bankroll,debt,model:template({key,name,job:`Apostador do Coliseu · perfil ${style}`,appearance:`Viajante de ${origin}; olhos treinados para a arena e para quem observa a arena. ${notes}`,clothes:'Roupas práticas para arquibancada e fuga rápida, com um detalhe discreto que denuncia a origem.',behavior:`${style}. ${debt?'Evita qualquer pergunta que possa revelar a dívida.':'Mantém o rosto calmo mesmo quando o caixa diminui.'}`,voice:'Fala baixo durante a cotação e mais rápido quando alguém oferece informação exclusiva.',routine,desire:purpose,fear:debt?`Que a cobrança de ${debt} T$ alcance o Coliseu antes de encontrar uma saída.`:'Perder o pouco controle que ainda possui sobre dinheiro e informação.',secret:`${notes}${debt?` A dívida registrada é de ${debt} T$ e pode ser usada como alavanca narrativa.`:''}`,hook:`Um resultado de Batalha de Equipes pode aproximar ${name} do objetivo ou forçá-lo a pedir ajuda aos personagens.`,tactics:'Evita combate; em perigo busca segurança, testemunhas e uma rota de fuga. Sabe usar rumores, favores e o próprio dinheiro como defesa.',possessions,cash:bankroll})};
  }),
  ...CIRCUIT_PERSONNEL.map(([name,role,publicText,secret])=>{
    const [possessions,routine]=PERSONNEL_PROPS[name];const key=npcKey(name);
    return {key,kind:'personnel',role,model:template({key,name,job:`Bastidores do Teatro · ${role}`,appearance:`Profissional do Coliseu que carrega o cansaço de muitos espetáculos. ${publicText}`,clothes:'Uniforme funcional do Teatro, remendado nos pontos de maior uso e sem insígnia que revele lealdade demais.',behavior:'Faz o trabalho com precisão; trata a crueldade da arena como problema logístico até que alguém cruza um limite.',voice:'Controlada e econômica, capaz de ficar gentil ou fria conforme o público exige.',routine,desire:'Manter sua posição no Teatro sem abandonar a própria linha moral.',fear:'Que um erro de bastidor vire uma morte que poderia ter sido evitada.',secret,hook:`Os personagens podem precisar de ${name} para atravessar uma porta, descobrir uma irregularidade ou proteger alguém do sistema do Coliseu.`,tactics:'Evita confronto aberto. Conhece passagens, horários e procedimentos do Coliseu; chama ajuda e protege civis antes de lutar.',possessions,cash:55})};
  })
].map(row=>({...row,model:{...row.model,
  sourceModule:'quedaco-teatro',
  context:'Circuito Inicial do Teatro dos Condenados, Coliseu de Kravokia no Deserto de Mirmir.',
  teamId:row.teamName?`teatro-team:${npcKey(row.teamName)}`:'',
  tags:['quedaco','teatro-dos-condenados','circuito-inicial',row.kind,...(row.teamName?[`equipe:${npcKey(row.teamName)}`]:[]),...(row.style?[`perfil:${npcKey(row.style)}`]:[])],
  description:`Cadastro do Circuito Inicial do Teatro dos Condenados. Papel: ${row.role??row.style??'bastidores'}.`
}})));

export function circuitNpc(key){return CIRCUIT_NPCS.find(row=>row.key===key)??null;}
export function restoreCircuitLinks(state,actors){
  const rows=Array.from(actors??[]),links=CIRCUIT_NPCS.flatMap(row=>{
    const matches=rows.filter(actor=>actor.flags?.['quedaco-teatro']?.npc?.key===row.key||actor.flags?.[CREATOR_ID]?.npcModel?.id===row.model.id);
    return matches.length===1?[{key:row.key,actorId:matches[0].id}]:[];
  });
  applyCircuitActorLinks(state,links);
  for(const record of [...state.teams.flatMap(t=>t.members),...state.bettors,...(state.personnel??[])]){const actor=rows.find(a=>a.id===record.actorId);if(actor)record.img=actor.img;}
  return state;
}

async function repairActorVisual(actor){
  if(!actor?.update)return;
  const portrait=actor.img&& !String(actor.img).includes('mystery-man') ? actor.img : NPC_PORTRAIT;
  const token=actor.prototypeToken?.texture?.src && !String(actor.prototypeToken.texture.src).includes('mystery-man') ? actor.prototypeToken.texture.src : NPC_TOKEN;
  await actor.update({img:portrait,'prototypeToken.texture.src':token,'prototypeToken.name':actor.name});
}

/** Cria as fichas pela API oficial e devolve vínculos, sem tocar no estado do Teatro. */
export async function createCircuitActors(creator,{game=globalThis.game,onProgress=()=>{}}={}){
  const batchAvailable=Boolean(creator?.capabilities?.npcBatch&&typeof creator.prepareNpcBatch==='function'&&typeof creator.createNpcBatch==='function');
  const individualAvailable=typeof creator?.prepareNpcTemplate==='function'&&typeof creator?.createNpcFromTemplate==='function';
  if(!creator?.capabilities?.npcTemplates||(!batchAvailable&&!individualAvailable))throw Error('Instale e ative QUEDAÇO - Personagens Skyfall RPG para criar as fichas do elenco.');
  const batch={name:'Teatro dos Condenados · Circuito Inicial',npcs:CIRCUIT_NPCS.map(row=>row.model)};
  if(batchAvailable){
    const preview=await creator.prepareNpcBatch(batch);
    if(preview.errors?.length)throw Error(`O Criador encontrou ${preview.errors.length} ficha(s) inválida(s): ${preview.errors.slice(0,3).map(row=>`${row.name??row.id}: ${row.error}`).join(' · ')}`);
    const result=await creator.createNpcBatch(batch,{expectedSignature:preview.signature});
    const failures=(result.results??[]).filter(row=>['error','needs-review'].includes(row.status));
    if(failures.length)throw Error(`O lote criou parte das fichas, mas ${failures.length} ficou com pendência: ${failures.slice(0,3).map(row=>`${row.name}: ${row.error??row.status}`).join(' · ')}`);
    const linked=[];
    for(const item of result.results??[]){
      const row=CIRCUIT_NPCS.find(candidate=>candidate.model.id===item.id);if(!row)continue;
      const actor=await globalThis.fromUuid?.(item.actorUuid)??Array.from(game.actors??[]).find(candidate=>candidate.uuid===item.actorUuid);
      if(!actor)throw Error(`${item.name}: a ficha foi criada, mas não pôde ser vinculada ao Teatro.`);
      await repairActorVisual(actor);
      const tag={key:row.key,kind:row.kind,teamName:row.teamName??'',role:row.role??'',registeredAt:Date.now()};
      await actor.setFlag?.('quedaco-teatro','npc',tag);
      if(row.kind==='competitor')await actor.setFlag?.('quedaco-teatro','competitor',{teamName:row.teamName,role:row.role,registeredAt:tag.registeredAt});
      linked.push({key:row.key,actorId:actor.id,actorUuid:actor.uuid});
    }
    return {created:result.created??0,existing:result.existing??0,linked,warnings:result.warnings??[]};
  }
  const previews=[];
  for(const row of CIRCUIT_NPCS){
    onProgress(row);
    previews.push([row,await creator.prepareNpcTemplate(row.model)]);
  }
  const linked=[];let created=0,existing=0;
  for(const [row,preview] of previews){
    const result=await creator.createNpcFromTemplate(row.model,{expectedSignature:preview.signature});
    const actor=await globalThis.fromUuid?.(result.actorUuid)??Array.from(game.actors??[]).find(candidate=>candidate.uuid===result.actorUuid);
    if(!actor)throw Error(`${row.model.name}: a ficha foi criada, mas não pôde ser vinculada ao Teatro.`);
    await repairActorVisual(actor);
    const tag={key:row.key,kind:row.kind,teamName:row.teamName??'',role:row.role??'',registeredAt:Date.now()};
    await actor.setFlag?.('quedaco-teatro','npc',tag);
    if(row.kind==='competitor')await actor.setFlag?.('quedaco-teatro','competitor',{teamName:row.teamName,role:row.role,registeredAt:tag.registeredAt});
    linked.push({key:row.key,actorId:actor.id,actorUuid:actor.uuid});
    if(result.status==='created')created++;else existing++;
  }
  return {created,existing,linked};
}

export function applyCircuitActorLinks(state,links){
  const byKey=new Map(links.map(link=>[link.key,link]));
  for(const team of state.teams)for(const member of team.members){const linked=byKey.get(npcKey(member.name));if(linked)member.actorId=linked.actorId;}
  for(const bettor of state.bettors){const linked=byKey.get(npcKey(bettor.name));if(linked)bettor.actorId=linked.actorId;}
  for(const person of state.personnel??[]){const linked=byKey.get(npcKey(person.name));if(linked)person.actorId=linked.actorId;}
  return clone(state);
}

/** Completa a tag de competição com o ID da equipe criado no Journal do Teatro. */
export async function synchronizeCircuitCompetitorTags(state,{game=globalThis.game}={}){
  for(const team of state.teams)for(const member of team.members){
    if(!member.actorId)continue;
    const actor=game.actors?.get?.(member.actorId)??Array.from(game.actors??[]).find(candidate=>candidate.id===member.actorId);
    if(actor)await actor.setFlag?.('quedaco-teatro','competitor',{teamId:team.id,teamName:team.name,role:member.role,registeredAt:Date.now()});
  }
}

const actorById=(actors,id)=>actors?.get?.(id)??Array.from(actors??[]).find(actor=>actor.id===id);
async function theatreFolder(name,parent,{game,FolderClass}){
  const existing=Array.from(game.folders??[]).find(folder=>folder.type==='Actor'&&folder.name===name&&(folder.folder?.id??folder.folder??'')===(parent?.id??''));
  if(existing)return existing;
  const Folder=FolderClass??globalThis.Folder??globalThis.foundry?.documents?.Folder;
  if(!Folder?.create)throw Error('A API de Pastas do Foundry não está disponível.');
  return Folder.create({name,type:'Actor',folder:parent?.id??null,color:'#7a361f',sorting:'a'});
}

/** Organiza Actors sincronizados no diretório para abrir, clicar ou arrastar sem procurar nomes. */
export async function organizeCircuitActors(state,{game=globalThis.game,FolderClass}={}){
  const root=await theatreFolder('Teatro dos Condenados',null,{game,FolderClass});
  const teamsRoot=await theatreFolder('Equipes',root,{game,FolderClass});
  const bettorsRoot=await theatreFolder('Apostadores',root,{game,FolderClass});
  const personnelRoot=await theatreFolder('Bastidores',root,{game,FolderClass});
  for(const team of state.teams){
    const folder=await theatreFolder(team.name,teamsRoot,{game,FolderClass});
    for(const member of team.members){const actor=actorById(game.actors,member.actorId);if(actor?.update)await actor.update({folder:folder.id});}
  }
  for(const row of state.bettors){const actor=actorById(game.actors,row.actorId);if(actor?.update)await actor.update({folder:bettorsRoot.id});}
  for(const row of state.personnel??[]){const actor=actorById(game.actors,row.actorId);if(actor?.update)await actor.update({folder:personnelRoot.id});}
  return root;
}

export function installCircuit(state) {
  if(state.rosterInstalled)throw Error('O circuito inicial já foi instalado neste Teatro.');
  for(const source of CIRCUIT_TEAMS)state.teams.push({id:uid(),name:source.name,sponsor:source.sponsor,fame:source.fame,visible:source.visible,identity:source.identity,members:source.members.map(([name,role,bio])=>({actorId:'',npcKey:npcKey(name),name,role,bio}))});
  for(const [name,origin,purpose,style,bankroll,debt,notes] of CIRCUIT_BETTORS)state.bettors.push({id:uid(),name,origin,purpose,style,bankroll,debt,actorId:'',notes});
  state.personnel ??=[];
  for(const [name,role,publicText,secret] of CIRCUIT_PERSONNEL)state.personnel.push({id:uid(),name,role,publicText,secret,actorId:''});
  state.rosterInstalled=true;
  return clone(state);
}
