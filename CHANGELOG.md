# 0.11.0

- Menu ativo iluminado, jogos em duas colunas com mapas completos e gaveta de modalidades desativadas.
- Apostadores ficam dentro de Apostas; Equipes e elenco compartilham menu, com criação recolhida e contagem de pendências. Dossiê por último.
- Gera uma a quatro provas com NPCs vinculados, escalação visual, número e prêmios predefinidos, além de apostas automáticas dos apostadores com saldo disponível.
- Provas simuladas dispensam Cena. Depois de encerrar apostas, sortear finaliza uma vez com pesos por fama, placar e motivo narrativo registrado.
- Minhas apostas mostra resultados e resgate em pilas. A oferta de novas apostas de itens foi retirada da interface; bilhetes antigos continuam resgatáveis.
- Recupera vínculos existentes pelas tags do Criador e publica retratos das equipes.
- Explica o Dossiê como caderno do mestre e o Coliseu como dimensão de bolso com áreas de convivência e portais de disputa.

# 0.10.4

- A inscrição lê a classe real do Actor pelo Item de classe do Skyfall.
- O seletor de classe só aparece como recuperação quando a ficha não possui Combatente, Especialista ou Ocultista reconhecível.
- Cards de personagens foram reduzidos e organizados em uma grade vertical compacta.

# 0.10.3

- Corrige os 40 modelos que enviavam pertences como texto ao Criador. Agora enviam uma lista de itens, compatível com a biografia e o inventário narrativo.
- Adiciona verificação do contrato de pertences para evitar a regressão `npc.possessions.join is not a function`.

# 0.10.2

- Declara Foundry 13 como versão verificada para remover o selo de compatibilidade desconhecida.
- Adiciona imagem de entrada da Corrida dos Escorpiões separada do mapa tático.
- A apresentação de cada modalidade agora aceita uma arte de portal/entrada além da miniatura da arena.

# 0.10.1

- NPCs do circuito agora enviam retrato e textura de Token ao Criador.
- A sincronização também repara Actors já existentes que ficaram com `mystery-man` ou sem textura, sem duplicar fichas.

# 0.10.0

- Reorganiza a identidade visual: QUEDAÇO como marca pequena e Teatro dos Condenados como título principal do Coliseu de Kravokia.
- Inclui banner de Kravokia no Deserto de Mirmir e mantém o Dossiê exclusivamente na direção do mestre.
- Simplifica a criação de provas: número sequencial, terreno, cotação e prêmio vêm de presets editáveis; lados e modalidade são o essencial.
- Cards de apostadores tentam localizar Actors pelas tags estáveis do Teatro e exibem retratos quando as fichas já foram sincronizadas.
- Documenta o esforço por frente e as decisões pendentes da próxima etapa.

# 0.9.0

- Inscrição colaborativa por personagem, com taxa única de 10 pilas, classes e retratos.
- Equipes abertas, lista de inscritos disponíveis, convites com aceite e solicitação de vagas em provas abertas.
- Apostas de jogadores debitam pilas da ficha; itens físicos podem ser apostados pelo preço da ficha, com custódia e devolução na vitória/anulação. Resgate de lucro em pilas.
- Processamento por um mestre ativo, validação do proprietário, proteção contra cobrança e pagamento repetidos.
- Cards de apostadores e bastidores vinculados a fichas; patrocinadores excluem o tipo Ameaça do Skyfall.
- Atualizações colaborativas preservam o cartaz e não publicam alterações de narração ainda em preparação.

# 0.8.1

- Corrige a criação dos NPCs Combatentes: o modelo agora prioriza o par compatível Combate com uma arma / Façanha com uma arma.

# 0.8.0

- Cria modo enxuto: só Duelo do Anel, Batalha de Equipes, Corrida dos Escorpiões e Jogo do Silêncio são publicados inicialmente; cada jogo pode ser ocultado ou liberado individualmente.
- Adiciona cards de jogos com miniaturas, notas de narração e cenas-modelo de abertura direta.
- Inclui três mapas originais ortogonais: Anel da Areia Negra, Pista de Mirmir e Pátio das Campânulas.
- Remove Contratos e Direção da navegação e organiza o elenco sincronizado em Actors › Teatro dos Condenados, com cards arrastáveis de equipe.

# 0.7.0

- Adiciona **Duelo do Anel** completo: prova 1×1, regulamento público, apostas, duelistas, Cena própria, Tokens centrais e iniciativa.
- Inclui vitória por rendição, desarme, incapacidade, pontos ou tempo; magia, armas, saída do anel, mortes e enfermaria são registrados antes da luta.

# 0.6.0

- O Circuito Inicial agora envia os 40 NPCs em um lote assinado quando o Criador de Personagens oferece `npcBatch` (v0.1.9+); versões anteriores continuam usando a ponte individual compatível.
- Todos os modelos levam proveniência `quedaco-teatro`, contexto do Teatro, tags de circuito, função e equipe, permitindo localizar e organizar os Actors dentro do Criador.

# 0.5.0

- Batalha de Equipes agora monta a **Areia da Prova**, uma Cena 30×20 com miniatura, seis zonas de entrada e arte original incluída no módulo.
- A Mestra escala exatamente três Actors por lado (NPCs ou personagens jogadores); o painel cria/reconstrói somente os Tokens da prova, os posiciona nas zonas e rola a iniciativa no Combate correspondente.
- Novos controles para abrir o mapa, reconstruir a escalação e abrir/iniciar a prova sem perder a ligação entre apostas, placar e cena.

# 0.4.0

- O Circuito Inicial agora traz 40 modelos de NPC detalhados: 16 competidores, 16 apostadores e oito pessoas de bastidor, cada qual com objetivo, receio, segredo, rotina, itens narrativos, dinheiro e gancho de cena.
- A aba Elenco usa a API oficial de **QUEDAÇO - Personagens Skyfall RPG** para pré-validar e criar Actors nativos do sistema Skyfall; fichas existentes pelo mesmo modelo são reaproveitadas, nunca duplicadas.
- As fichas recebem as tags `quedaco-teatro.npc` e, para competidores, `quedaco-teatro.competitor`; os vínculos voltam automaticamente para equipes, apostadores e bastidores.

# 0.3.0

- Adicionado Circuito Inicial: quatro equipes, 16 competidores, 16 apostadores e oito pessoas de bastidor.
- Novo painel Elenco para instalar e consultar o circuito sem criar fichas genéricas antes do modelo do Criador de Personagens.
- Registros de competidores incluem estilo, origem e gancho; apostadores incluem caixa, dívida e motivação; bastidores incluem segredos de condução.

# 0.2.0

- A Batalha de Equipes ganhou formato, condição de vitória, alvo, rodadas, mortes, enfermaria, placar e andamento ao vivo.
- Iniciar a batalha fecha as apostas; pontos e mortes são registrados, e o objetivo encerra e liquida a prova automaticamente.
- Apostadores passaram a ter origem, objetivo, perfil, caixa, dívida e vínculo opcional com Actor.
- Equipes aceitam Actors do mundo; cada inscrição aplica a tag `quedaco-teatro.competitor` no Actor.

# 0.1.0

- Painel ApplicationV2 para mestre e apresentação pública persistente.
- Dossiê editável de Kravokia com revelação por registro e segredos reservados.
- Programação, cotações, apostas, encerramento e anulação com restituição.
- Equipes, reputação, contratos, público e incidentes.
- Contrato de descoberta QUEDAÇO v1, testes de modelo e interface, pacote local.
