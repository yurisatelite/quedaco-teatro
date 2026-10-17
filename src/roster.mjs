import {clone, uid} from './model.mjs';

// Conteúdo autoral pronto para mesa. As fichas completas serão geradas pelo
// Criador de Personagens quando o modelo de importação for fornecido.
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

export function installCircuit(state) {
  if(state.rosterInstalled)throw Error('O circuito inicial já foi instalado neste Teatro.');
  for(const source of CIRCUIT_TEAMS)state.teams.push({id:uid(),name:source.name,sponsor:source.sponsor,fame:source.fame,visible:source.visible,identity:source.identity,members:source.members.map(([name,role,bio])=>({actorId:'',name,role,bio}))});
  for(const [name,origin,purpose,style,bankroll,debt,notes] of CIRCUIT_BETTORS)state.bettors.push({id:uid(),name,origin,purpose,style,bankroll,debt,actorId:'',notes});
  state.personnel ??=[];
  for(const [name,role,publicText,secret] of CIRCUIT_PERSONNEL)state.personnel.push({id:uid(),name,role,publicText,secret,actorId:''});
  state.rosterInstalled=true;
  return clone(state);
}
