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
