// Proposta autoral de campanha. Não representa cânone oficial de Skyfall.
const entry = (category,id,name,text,secret,revealed=false) => ({category,id,name,text,secret,revealed});
export const CATEGORIES = {place:'Lugares',npc:'Personagens',game:'Jogos',faction:'Facções',hook:'Aventuras',rule:'Funcionamento'};
export const CATALOG = [
  entry('place','praca','Praça das Caravanas','Mercadores, competidores e carregadores chegam entre pregões e poeira. Contrate escoltas, procure patrocinadores ou compre notícias do deserto.','Antes dos portões abrirem, uma carroça leva prisioneiros disfarçados de feridos para a enfermaria.',true),
  entry('place','portoes','Portões da Glória','Estátuas de campeões vigiam a entrada. Ingressos populares, comerciais e camarotes têm filas separadas. Armas de competidores são registradas.','Uma das estátuas representa alguém que ainda está vivo. Um fiscal vende passes falsos.',true),
  entry('place','mercado','Mercado dos Espectadores','Comida, bandeiras de campeões, talismãs e lembranças disputam o espaço com corretores. Negocie equipamento, trabalhe como artista ou encontre informantes.','Poções baratas são adulteradas. A fornecedora aceita proteção para revelar o laboratório.',true),
  entry('place','arena','Arena da Areia Negra','Dunas, plataformas, ruínas e vapor mudam o terreno de cada prova. Vitória pode significar resgatar, capturar ou sobreviver.','Os mecanismos respondem ao medo e guardam lembranças dos derrotados.',true),
  entry('place','arquibancadas','Anéis e camarotes','O anel popular canta; mercadores negociam nos intervalos; nobres assistem de camarotes protegidos. Cada setor oferece contatos e maneiras diferentes de entrar.','Rivais usam os cantos da torcida como código. Um camarote tem passagem direta ao cofre.',true),
  entry('place','tuneis','Túneis dos Competidores','Vestiários, treinamento, depósitos e oficinas. Atletas procuram parceiros, treinadores e representação contratual.','Mestre Salko mantém uma rota de fuga atrás do depósito de armas.'),
  entry('place','enfermaria','Enfermaria de Sangue','Cirurgiões e alquimistas tratam ferimentos e ajustam próteses. O atendimento básico consta no contrato de cada prova.','A médica Namar guarda provas de mortes encobertas e colheitas de sangue não autorizadas.'),
  entry('place','apostas','Casa das Apostas','Guichês oferecem cotações e comprovantes. Retorno anunciado inclui o valor apostado. Cancelamento devolve a aposta.','O cofre tem menos reservas do que os prêmios prometidos. Um grande azarão pode quebrar a Casa.',true),
  entry('place','contratos','Câmara dos Contratos','Inscrições, patrocínios, garantias e serviços são negociados aqui. Leia o que será cobrado por tratamento e equipamento.','Uma cláusula antiga vincula certos contratos às ruínas; destruir o papel pode não encerrar o vínculo.'),
  entry('place','ruinas','Ruínas Inferiores','Uma escadaria selada desce além das fundações. A administração proíbe a entrada.','O antigo mecanismo selecionava guardiões. Seus três selos dependem de promessas, lembranças e sangue.'),
  entry('npc','vespera','Vespera Krav · Diretora','Elegante, paciente e precisa. Oferece patrocínios em troca de resultados e discrição. Quer manter o espetáculo funcionando.','Conhece o ritual original. Precisa de um campeão, mas teme que a Casa seja sua próxima vítima.'),
  entry('npc','salko','Mestre Salko · Organizador','Ex-campeão com próteses, humor ácido e respeito pelos competidores. Pode oferecer treino ou trabalho.','Sabota listas de inscrição para retirar devedores das provas clandestinas.'),
  entry('npc','namar','Irmã Namar · Médica','Exausta, direta e cuidadosa. Exige que rendições sejam respeitadas. Precisa de ingredientes e escoltas.','Registra cada morte encoberta. Entregará suas provas quando houver proteção para sua equipe.'),
  entry('npc','cego','O Apostador Cego','Um apostador cercado de bilhetes vencidos. Troca palpites por histórias que ninguém contou.','Suas previsões são possibilidades, nunca certezas. Cada acerto custa uma lembrança.'),
  entry('npc','yara','Yara M’bo · Voz das Caravanas','Negocia água, passagem e proteção para comunidades do deserto. Procura aventureiros dispostos a recuperar relíquias.','Tem provas de que a expansão da arena ameaça uma cisterna comunitária.'),
  entry('npc','rask','Rask · Campeão sem Rosto','Um lutador mascarado de poucas palavras. A multidão conhece seus golpes, mas ninguém sabe sua história.','Cada vitória apaga uma memória. Sua dívida tem como garantia sua própria identidade.',true),
  entry('npc','polen','Mestre Pólen · Alquimista','Vende misturas regulamentadas e procura voluntários para testes. Garante que todo efeito passa.','Seu reagente mais recente mantém mortos em movimento. Um lote já foi entregue à arena.'),
  entry('npc','gemeas','As Gêmeas da Moeda · Arautas','Duas vozes anunciam adversários e cotações. Uma descreve o resultado; a outra narra o que quase aconteceu.','Uma das irmãs ouve o mecanismo sob as ruínas e confunde seus desejos com profecias.',true),
  ...[
    ['duelo','Duelo do Anel','Duas pessoas; vitória por rendição, desarme acordado ou incapacidade. Variantes: sem magia, armas sorteadas, terreno móvel.','Um patrocinador oferece prêmio por um golpe proibido.'],
    ['equipes','Batalha de Equipes','Capture três estandartes ou escolte o portador até a saída. Resgatar um aliado pode custar o objetivo.','O equipamento de uma equipe foi sabotado. A prova da fraude está no mecanismo.'],
    ['cacada','Caçada às Dunas','Expedição com recursos limitados: água, orientação e retorno com um marco de prova. Os resgates têm rota anunciada.','Uma tempestade corta o resgate. Negociar abrigo com uma caravana vale mais que chegar primeiro.'],
    ['labirinto','Labirinto de Ossos','Explore corredores, recolha três chaves e alcance a saída. Atalhos exigem escolhas e cooperação.','Uma porta se abre para as ruínas verdadeiras; um competidor pede para abandonar a prova.'],
    ['corrida','Corrida dos Escorpiões','Percurso de três voltas em montarias do deserto. Troca de montaria e agressões precisam constar no regulamento.','Um animal sente a vibração subterrânea e se recusa a correr.'],
    ['reliquia','Roubo da Relíquia','Carregue o objeto central até seu portão. O portador fica visível e precisa de proteção.','O troféu é uma chave ancestral e uma facção quer trocá-lo durante a premiação.'],
    ['banquete','Banquete dos Monstros','Atravesse o recinto e abra a saída. Iscas, furtividade e negociação com tratadores são alternativas ao combate.','Uma criatura é inteligente e oferece informação em troca de liberdade.'],
    ['torre','A Torre que Cai','Suba, recolha o sino e desça antes do último colapso anunciado. Plataformas caem por etapas.','Uma falha adianta o colapso; resgatar o rival rende mais prestígio que terminar.'],
    ['julgamento','Julgamento Público','Uma disputa combina testemunhos, provas e confronto ritual consentido. O veredicto precisa de evidências.','Uma testemunha foi comprada. A arena não substitui a justiça de toda Kravokia.'],
    ['semregras','A Noite sem Regras','Rumores falam de combates clandestinos nos túneis. A Casa nega qualquer envolvimento.','Um laboratório usa as provas como seleção de cobaias. A direção tenta comprar o silêncio das vítimas.'],
    ['silencio','O Jogo do Silêncio','Equipes atravessam obstáculos sem falar. Sinais e planejamento são permitidos; voz involuntária gera perda de ponto.','Um sabotador imita a voz de um competidor. Detectá-lo muda a final.'],
    ['memorias','Duelo das Memórias','Imagens de lembranças ocupam a arena. Cada participante escolhe o que revelar e pode interromper a experiência.','O mecanismo tenta guardar uma memória além do permitido. Ofereça saída e decisões, sem impor traumas aos jogadores.']
  ].map(([id,name,text,secret])=>entry('game',id,name,text,secret,true)),
  ...[
    ['casa','A Casa das Apostas','Administra cotações, reservas e contratos. Contrata investigadores e cobradores.','Sua tesouraria financia escavações proibidas.'],
    ['familias','Famílias Vampíricas','Patrocinadores disputam prestígio, camarotes e influência nos jogos.','Uma família quer arruinar Vespera sem interromper as pesquisas.'],
    ['caravanas','Caravanas de Mirmir','Transportam água, mercadorias e notícias. Cobram proteção e respeito às rotas.','Podem suspender o abastecimento se a cisterna for destruída.'],
    ['laboratorios','Laboratórios Alquímicos','Financiam provas de equipamentos, remédios e próteses.','Um fornecedor troca lotes aprovados por reagentes experimentais.'],
    ['contrabando','Contrabandistas dos Dutos','Vendem caminhos, objetos raros e contatos discretos.','Uma rota atravessa a enfermaria e o arquivo de contratos.'],
    ['culto','Areias Imóveis','Um grupo pede o fechamento das escavações. Alguns moradores os consideram alarmistas.','Um núcleo radical quer sabotar a final; os demais tentam impedir um massacre.']
  ].map(([id,name,text,secret])=>entry('faction',id,name,text,secret)),
  ...[
    ['primeiraluta','A Primeira Luta','Uma inscrição oferece dinheiro rápido e um adversário acessível.','O terreno foi sabotado. Pistas: rebite recente, ordem falsa, funcionário desaparecido. Resgate ou vitória abre caminho a Salko.'],
    ['fraude','A Fraude Perfeita','Uma sequência improvável de vitórias agita os guichês.','Investigue fornecedor, bilhetes e camarote. Escolhas: denunciar, negociar reparação ou lucrar e ganhar inimigos.'],
    ['impossivel','O Campeão Impossível','Rask deseja contratar o grupo para encontrar alguém que já não consegue descrever.','Sua identidade é a garantia. Recupere o contrato e desligue a máquina sem apagar o que resta dele.'],
    ['revolta','A Revolta dos Contratos','Trabalhadores recusam abrir os portões na noite da final.','A dívida médica foi inflada. Negocie com Namar, Casa e caravanas; violência compromete o abastecimento.'],
    ['torneio','O Verdadeiro Torneio','Campeões recebem convite para uma prova sem público.','Vespera revela a seleção de guardiões. Há alternativas: restaurar os selos, negociar ou recusar o sacrifício.'],
    ['cidade','O Coliseu contra Kravokia','Portões travam e as máquinas anunciam seu próprio julgamento.','Resgate o público, interrompa alimentação e decida quem controla as ruínas. Três objetivos paralelos permitem que todos participem.']
  ].map(([id,name,text,secret])=>entry('hook',id,name,text,secret)),
  entry('rule','fluxo','Tráfego e rotina','Manhã: caravanas e manutenção. Tarde: treinos e inscrições. Crepúsculo: bilheteria e jogos. Noite: premiação, festas e saída escalonada.','Use filas separadas para público, serviço, competidores e resgate. Em lotação alta, atrase portões, não a evacuação.',true),
  entry('rule','economia','Dinheiro e serviços','A Casa vende ingressos, concessões, patrocínios e serviços. Consulte o contrato antes de aceitar adiantamentos.','Fichas são uma unidade local configurável. O livro-caixa registra apostas; custos operacionais e rendas ficam a cargo do mestre.',true),
  entry('rule','regulamento','Regulamento da arena','Rendição interrompe a prova. Atendimento básico deve estar contratado. Magia, equipamentos e objetivos são anunciados antes das apostas.','Morte e violação de regra têm consequências. A mesa define limites para violência, dívidas coercitivas e perda de identidade.',true),
  entry('rule','segredo','O segredo em três camadas','O Teatro foi erguido sobre fundações antigas. A areia às vezes parece acompanhar os aplausos.','1: fraudes e patronos. 2: testes alquímicos em lutadores. 3: mecanismo de julgamento recolhe promessas, sangue e memórias. Cada camada tem pistas independentes.'),
  entry('rule','premios','Prêmios e oportunidades','Recompensas incluem dinheiro, cura, contratos melhores, liberdade negociada, mapas de ruínas e favores de patrocinadores.','Direito de Areia: licença autoral da campanha para entrar em uma ruína protegida; não é uma regra oficial.',true)
];
export const INCIDENTS = [
  'Uma caravana atrasa a abertura. Escoltar os carregadores rende um contato.',
  'Bilhetes falsos lotam um portão. A tinta deixa uma marca nos dedos do falsificador.',
  'Um tratador perdeu sua criatura; ela procura água, não uma luta.',
  'Uma criança encontra um contrato escondido numa lembrança de campeão.',
  'Dois camarotes exigem exclusividade sobre o mesmo lutador.',
  'Um vazamento de vapor bloqueia a saída de serviço; a multidão precisa ser redirecionada.',
  'A torcida canta o nome de alguém que desapareceu há vinte anos.',
  'Namar pede ajuda: um competidor recebeu a mistura errada antes da prova.',
  'Uma cobrança de dívida interrompe um treino. Há uma assinatura falsificada.',
  'Yara exige acesso à cisterna antes de liberar a próxima entrega.',
  'Uma estátua solta areia pela boca e pronuncia o nome do próximo vencedor.',
  'Um campeão oferece seu prêmio para que o adversário receba tratamento.'
];
