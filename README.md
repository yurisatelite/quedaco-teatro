# QUEDAÇO - O Teatro dos Condenados

Versão 0.9.0 para Foundry VTT 13. Conteúdo autoral de campanha situado em Kravokia e no Deserto de Mirmir, para uso com Skyfall RPG. Personagens, instituições, provas e mistérios são propostas da campanha, não afirmações de cânone. Não inclui texto de livros ou fichas oficiais.

## Inscrição dos jogadores

Depois de o mestre publicar o Teatro, cada jogador abre **Inscrição e equipes**, escolhe uma ficha própria e paga **10 pilas uma única vez por personagem**. O saldo usado é `system.currency.p`; trocados e kurmacs não são convertidos automaticamente. Um mestre precisa estar conectado. O módulo confere a propriedade da ficha e processa solicitações por um único mestre ativo.

Inscritos podem criar equipes, convidar outros inscritos sem equipe, aceitar ou recusar convites, solicitar vagas nas provas abertas e apostar. Retrato, inventário e pilas vêm da ficha. As classes disponíveis são Combatente, Especialista e Ocultista. A escolha no cadastro não modifica a classe mecânica do personagem. O mestre distribui as vagas solicitadas entre os lados da prova antes de montar a arena.

**Apostas em pilas** debitam a ficha e usam a cotação do bilhete. Após o resultado, use **Resgatar prêmios disponíveis**. **Apostas de itens** usam o preço da ficha em pilas e retiram a quantidade apostada de circulação. Vitória devolve o item e paga o lucro em pilas; anulação devolve o item; derrota entrega o item à Casa. Itens devem estar desequipados e desvinculados; pertences narrativos sem valor não são aceitos. Não apague o item de quantidade zero enquanto houver aposta pendente. Prêmios fracionários precisam de conversão pelo mestre.

Patrocinadores usam fichas de personagem sem proprietário jogador. No Skyfall, o tipo interno `npc` corresponde a **Ameaça** e é excluído dessa seleção. Ameaças continuam disponíveis ao mestre na escalação das provas.

## Instalação e abertura

No Foundry, acesse Add-on Modules → Install Module e cole este Manifest URL: https://github.com/yurisatelite/quedaco-teatro/releases/latest/download/module.json

Extraia `dist/quedaco-teatro.zip` em `Data/modules/quedaco-teatro/`, com `module.json` diretamente nessa pasta. Reinicie o Foundry e ative o módulo no mundo. Abra pelo botão Teatro dos Condenados no diretório de diários, pela ferramenta de máscaras na barra de tokens ou em Configurações → Configurações do módulo. Macro opcional: `game.modules.get('quedaco-teatro').api.openTheatre()`.

## Preparar e apresentar

O mestre recebe um painel com visão geral, dossiê, espetáculos, apostas, equipes, contratos e direção. A primeira abertura cria um JournalEntry privado que guarda a campanha. O dossiê inclui 10 lugares, 8 NPCs, 12 jogos, 6 facções, 6 aventuras e 5 orientações. Notas e textos do dossiê podem ser editados.

Escolha quais registros incluir usando “Incluir na próxima publicação”. Em Direção, salve público, clima e anúncio. Em Espetáculos, programe confrontos e escolha visibilidade. A prévia mostra a próxima publicação. “Mostrar para os jogadores” cria ou atualiza outro JournalEntry, somente com campos públicos, e abre a apresentação nos clientes conectados. Os jogadores navegam livremente pelos lugares, personagens revelados, modalidades e programação publicados. Alterações posteriores ficam em preparação até uma nova publicação.

“Fechar apresentação” limpa o conteúdo da cópia pública e fecha a janela nos clientes. Isso não desfaz o que alguém já leu ou copiou. Quem entrar depois consegue abrir o último cartaz ainda ativo pelo menu. O JournalEntry público guarda dados em flags para esta interface; sua folha padrão não é a apresentação.

## Modo enxuto, jogos e mapas

O cartaz novo começa apenas com **Duelo do Anel**, **Batalha de Equipes**, **Corrida dos Escorpiões** e **Jogo do Silêncio** liberados. Na aba **Jogos**, a Mestra pode liberar ou ocultar cada modalidade individualmente. Um jogo oculto não é publicado: jogadores não o veem como jogo disponível, nem no dossiê nem no painel de Jogos.

Os quatro cards ativos trazem miniatura, notas de condução e **Criar e abrir cena-modelo**. A primeira abertura cria uma Cena privada, que depois pode ser reaberta pelo card. Os mapas são originais, ortogonais e pensados para Tokens: Arena da Prova (equipes), Anel da Areia Negra (duelo), Pista de Mirmir (corrida) e Pátio das Campânulas (silêncio). Não há perspectiva inclinada nos mapas distribuídos.

## Batalha de equipes e apostas

Batalha de Equipes é a primeira modalidade implementada a fundo. Ao programá-la, defina formato, terreno, objetivo, condição de vitória, limite de rodadas, enfermaria e política de mortes. Escale três Actors por lado; podem ser competidores do Teatro, NPCs externos ou personagens de jogadores. Se não escolher Actors e as equipes tiverem integrantes vinculados, os três primeiros de cada uma serão usados. As condições são objetivos, eliminação, rendição e tempo; o painel registra o placar e as mortes. Iniciar a luta fecha apostas e marca o evento como em andamento. Quando a equipe alcança o alvo por objetivo ou eliminação, a vitória e os pagamentos são lançados; rendição, tempo e qualquer decisão narrativa podem ser fechados pelos botões de resultado. A anulação devolve todas as entradas.

Cada card de Batalha de Equipes exibe a miniatura da **Areia da Prova**, uma arena original 30×20 do Deserto de Mirmir incluída no módulo. Use **Montar arena, Tokens e iniciativa**: o módulo cria ou reutiliza uma Cena privada, coloca cada lado nas três entradas oeste/leste, monta um Combate apenas para aquela prova e rola a iniciativa. O botão **Abrir mapa da prova** leva a Mestra à Cena para ajustar livremente Tokens, paredes ou cenário antes de começar. **Reconstruir escalação nas zonas** remove apenas os Tokens e o Combate pertencentes àquela prova, reposiciona os seis selecionados e rola uma iniciativa nova.

Crie equipes antes da batalha e inscreva Actors existentes no mundo. A inscrição registra o membro no Teatro e salva a tag `quedaco-teatro.competitor` no Actor com equipe, papel e data; ela não altera ficha, poderes, itens, HP ou ownership.

## Duelo do Anel

O **Duelo do Anel** é uma prova 1 contra 1 completa. Antes da abertura das apostas, escolha dois Actors diferentes e anuncie condição de vitória (rendição, desarme, incapacidade, pontos ou decisão por tempo), política de magia, armas, efeito de sair do anel, mortes, enfermaria e limite de rodadas. As cotações, apostas, anulação e liquidação usam o mesmo livro-caixa seguro das demais provas.

Use **Montar Anel, Tokens e iniciativa** para criar uma Cena exclusiva chamada **Anel da Areia Negra**: ela usa a arte original já incluída, posiciona os dois duelistas no círculo central e cria um Combate próprio com iniciativa rolada. Os controles em andamento só oferecem o resultado previsto no regulamento; para pontos e saída do anel o placar é atualizado, e para rendição, desarme ou incapacidade a vitória é encerrada imediatamente. O mestre ainda pode registrar um resultado narrativo pelos botões de vitória ou anular e devolver as entradas.

## Circuito inicial e futuras fichas

Na aba **Elenco**, a Mestra instala uma vez o Circuito Inicial: Dunas de Vidro, Filhos do Atoleiro, Lâminas do Crepúsculo e Quebravento, cada uma com quatro competidores e estilo próprio; há ainda 16 apostadores e oito pessoas de bastidor. Todo registro possui origem, objetivo, receio, segredo, rotina, itens narrativos, dinheiro e gancho de cena.

Com **QUEDAÇO - Personagens Skyfall RPG** instalado e ativo, use **Criar / sincronizar fichas do elenco**. O Teatro contém os 40 modelos e os entrega ao Criador apenas quando você pede a sincronização. No Criador v0.1.9 ou superior, eles seguem como um lote assinado único; em versões anteriores, continuam pela ponte individual compatível. Em ambos os casos, o Criador confere todos os compêndios da mesa antes de gravar Actors nativos. Cada Actor recebe a proveniência `quedaco-teatro`, tags de circuito/função/equipe e `quedaco-teatro.npc`; os 16 competidores recebem também `quedaco-teatro.competitor`. Um segundo uso não duplica modelos já criados e restaura os vínculos com equipe, apostador ou bastidor. Se a criação em si falhar depois de alguma ficha, o Criador preserva a ficha pendente para revisão e informa o erro — nunca apaga ou recria Actors automaticamente.

Depois da sincronização, procure no diretório **Actors › Teatro dos Condenados**. Dentro dele há as pastas **Equipes** (com uma pasta por equipe), **Apostadores** e **Bastidores**. Arraste qualquer Actor de lá para a Cena; na aba **Equipes**, os cards com miniatura também abrem a ficha com um clique e podem ser arrastados.

Apenas o mestre registra apostas nesta versão. As cotações são decimais: apostar 100 a 1,75 retorna 175 no total se vencer. A cotação fica congelada no bilhete. Cadastre apostadores da plateia com origem, objetivo, perfil, caixa e dívida para criar conversa, suspeita e ganchos de contrato; o caixa do apostador diminui ao entrar e recebe o retorno na liquidação. Pode vincular o registro a um Actor, mas o módulo não transfere moedas nem itens entre fichas.

Equipes têm fama e patrocinador privado; somente nome e fama são publicados quando autorizados. Contratos guardam parte, condições e dívida, com registro de encerramento. Quitação não altera automaticamente caixa ou dívida nas fichas. Incidentes usam rolagem local do Foundry, sem mensagem pública de chat.

## Privacidade e armazenamento

O estado de campanha, os segredos editados, as apostas e os contratos ficam no JournalEntry de direção com ownership default NONE. A publicação usa uma lista explícita de campos e ownership OBSERVER. Nenhum socket transmite a direção e nenhum segredo de campanha é salvo em settings globais. O acesso é controlado pelas permissões de documentos do Foundry. Não conceda acesso ao diário privado. O material inicial vem nos arquivos distribuídos do módulo: como em qualquer aventura instalada, alguém que inspecione esses arquivos pode ler seu conteúdo autoral original. Isso não expõe as notas privadas gravadas no mundo.

Escritas são serializadas no cliente; formulários verificam revisão para detectar edições antigas. Esta versão presume um mestre editando por vez: não possui trava de transação entre mestres em computadores diferentes. Faça backup do mundo para preservar os dados. Desativar o módulo não apaga seus diários.

## Integração QUEDAÇO v1

Funciona sem outros módulos. Publica o descritor `family: 'quedaco'`, `contractVersion: 1`, capacidades `openTheatre` e `publicPresentation`, e o hook `quedaco:register` após a inicialização. `openTheatre()` abre a interface adequada ao usuário; `getPublicPresentation()` retorna cópia do cartaz ativo ou null; `getStatus()` é síncrono, sem dados privados e informa inicialização e geração compatível. `connections: []` indica que não há consultas funcionais a outros módulos implementadas nesta versão.

## Verificação e escopo

`npm test` verifica projeções, permissões, finanças, publicação e revisões em um host simulado. `npm run test:ui` usa o Playwright já instalado em `../quedaco-campanhas`, com Edge, para testar o app real em uma simulação de Foundry e gerar capturas em output. `npm run package` gera o ZIP. Teste integrado com mestre e jogador em um mundo real ainda é necessário; o manifesto não declara uma geração como verified antes disso.

Além da Areia da Prova e dos Actors do Circuito, o módulo ainda não cria compêndios, tabelas oficiais ou torneios automatizados. As próximas modalidades poderão reutilizar o mesmo padrão de Cena, escalação, zonas de entrada, Tokens e Combate; o combate continua usando as regras nativas do sistema Skyfall.
