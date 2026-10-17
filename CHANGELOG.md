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
