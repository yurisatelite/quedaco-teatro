# QUEDAÇO - O Teatro dos Condenados

Versão inicial 0.1.0 para Foundry VTT 13, baseada na instalação local 13.351. Conteúdo autoral de campanha situado em Kravokia e no Deserto de Mirmir, para uso com Skyfall RPG. Personagens, instituições, provas e mistérios são propostas da campanha, não afirmações de cânone. Não inclui texto de livros ou fichas oficiais.

## Instalação e abertura

No Foundry, acesse Add-on Modules → Install Module e cole este Manifest URL: https://github.com/yurisatelite/quedaco-teatro/releases/latest/download/module.json

Extraia `dist/quedaco-teatro.zip` em `Data/modules/quedaco-teatro/`, com `module.json` diretamente nessa pasta. Reinicie o Foundry e ative o módulo no mundo. Abra pelo botão Teatro dos Condenados no diretório de diários, pela ferramenta de máscaras na barra de tokens ou em Configurações → Configurações do módulo. Macro opcional: `game.modules.get('quedaco-teatro').api.openTheatre()`.

## Preparar e apresentar

O mestre recebe um painel com visão geral, dossiê, espetáculos, apostas, equipes, contratos e direção. A primeira abertura cria um JournalEntry privado que guarda a campanha. O dossiê inclui 10 lugares, 8 NPCs, 12 jogos, 6 facções, 6 aventuras e 5 orientações. Notas e textos do dossiê podem ser editados.

Escolha quais registros incluir usando “Incluir na próxima publicação”. Em Direção, salve público, clima e anúncio. Em Espetáculos, programe confrontos e escolha visibilidade. A prévia mostra a próxima publicação. “Mostrar para os jogadores” cria ou atualiza outro JournalEntry, somente com campos públicos, e abre a apresentação nos clientes conectados. Os jogadores navegam livremente pelos lugares, personagens revelados, modalidades e programação publicados. Alterações posteriores ficam em preparação até uma nova publicação.

“Fechar apresentação” limpa o conteúdo da cópia pública e fecha a janela nos clientes. Isso não desfaz o que alguém já leu ou copiou. Quem entrar depois consegue abrir o último cartaz ainda ativo pelo menu. O JournalEntry público guarda dados em flags para esta interface; sua folha padrão não é a apresentação.

## Apostas e gestão

Apenas o mestre registra apostas nesta versão. As cotações são decimais: apostar 100 a 1,75 retorna 175 no total se vencer. A cotação fica congelada no bilhete. Encerrar apostas bloqueia novos bilhetes; confirmar vitória liquida todos uma única vez; anular devolve os valores. O caixa recebe entradas e deduz retornos. Pode ficar negativo, representando insolvência. O módulo não transfere moedas nem itens entre fichas.

Equipes têm fama e patrocinador privado; somente nome e fama são publicados quando autorizados. Contratos guardam parte, condições e dívida, com registro de encerramento. Quitação não altera automaticamente caixa ou dívida nas fichas. Incidentes usam rolagem local do Foundry, sem mensagem pública de chat.

## Privacidade e armazenamento

O estado de campanha, os segredos editados, as apostas e os contratos ficam no JournalEntry de direção com ownership default NONE. A publicação usa uma lista explícita de campos e ownership OBSERVER. Nenhum socket transmite a direção e nenhum segredo de campanha é salvo em settings globais. O acesso é controlado pelas permissões de documentos do Foundry. Não conceda acesso ao diário privado. O material inicial vem nos arquivos distribuídos do módulo: como em qualquer aventura instalada, alguém que inspecione esses arquivos pode ler seu conteúdo autoral original. Isso não expõe as notas privadas gravadas no mundo.

Escritas são serializadas no cliente; formulários verificam revisão para detectar edições antigas. Esta versão presume um mestre editando por vez: não possui trava de transação entre mestres em computadores diferentes. Faça backup do mundo para preservar os dados. Desativar o módulo não apaga seus diários.

## Integração QUEDAÇO v1

Funciona sem outros módulos. Publica o descritor `family: 'quedaco'`, `contractVersion: 1`, capacidades `openTheatre` e `publicPresentation`, e o hook `quedaco:register` após a inicialização. `openTheatre()` abre a interface adequada ao usuário; `getPublicPresentation()` retorna cópia do cartaz ativo ou null; `getStatus()` é síncrono, sem dados privados e informa inicialização e geração compatível. `connections: []` indica que não há consultas funcionais a outros módulos implementadas nesta versão.

## Verificação e escopo

`npm test` verifica projeções, permissões, finanças, publicação e revisões em um host simulado. `npm run test:ui` usa o Playwright já instalado em `../quedaco-campanhas`, com Edge, para testar o app real em uma simulação de Foundry e gerar capturas em output. `npm run package` gera o ZIP. Teste integrado com mestre e jogador em um mundo real ainda é necessário; o manifesto não declara uma geração como verified antes disso.

A versão inicial não cria mapas de combate, Actors, compêndios, tabelas oficiais ou torneios automatizados. As modalidades têm regras narrativas e orientações; o combate usa o sistema do mundo. O objetivo desta entrega é uma direção utilizável e um cartaz compartilhável sobre os quais ampliar o módulo.
