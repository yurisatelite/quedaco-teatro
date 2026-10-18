# Escopo da atualização do Coliseu de Kravokia

## Identidade e visibilidade

- `QUEDAÇO` é a marca de referência de módulos e fica pequeno.
- `TEATRO DOS CONDENADOS` é o nome grande da experiência.
- O jogador vê apenas o `Coliseu de Kravokia`, inscrição/equipes, jogos liberados e provas publicadas.
- O Dossiê, origem, objetivo, dívidas e anotações privadas ficam exclusivamente na direção do mestre.
- A imagem de Kravokia no Deserto de Mirmir foi incorporada como banner do Coliseu.

## Inscrição e apostas do jogador

- A inscrição custa 10 pilas por personagem e permite escolher Combatente, Especialista ou Ocultista.
- O card mostra retrato, saldo, inventário e, quando confirmado, o marcador visual de inscrição.
- Depois de inscrito, o jogador pode solicitar vaga numa prova aberta e apostar pilas ou itens.
- A aposta do jogador fica no mesmo fluxo da inscrição; não é necessário abrir a área de mestre.
- A inscrição persistida nesta versão representa o cadastro no Coliseu. A duração por visita/saída é uma decisão de regra de campanha que será isolada numa próxima migração para não apagar inscrições já existentes.

## NPCs, Actors e Tokens

- O circuito inicial tem 16 competidores, 16 apostadores e 8 pessoas de bastidores.
- Os Actors recebem a tag `quedaco-teatro.npc`, vínculo de função e, quando competidores, vínculo de equipe.
- Cards vinculados abrem a ficha e aceitam arrastar para a Cena.
- Cards tentam localizar o Actor tanto pelo ID salvo quanto pela tag estável do Teatro; isso permite corrigir vínculos depois da criação em lote.
- Ameaças continuam fora de patrocinadores, apostadores e bastidores. O mestre adiciona Ameaças somente na preparação da prova.

## Provas automáticas

Ao criar uma prova, o mestre escolhe apenas modalidade, equipes/lados e, quando aplicável, os Actors. O módulo gera um identificador sequencial de seis dígitos, usa uma predefinição e mantém os campos editáveis antes da publicação.

| Modalidade | Terreno | Cotação inicial | Prêmio inicial |
|---|---|---:|---|
| Duelo do Anel | Anel de areia negra | 2 × / 2 × | 60 pilas + direito de escolher a próxima arma |
| Batalha de Equipes | Arena das bandeiras | 1,8 × / 2,2 × | 120 pilas + tratamento completo para a equipe |

Os quatro jogos públicos continuam sendo Duelo do Anel, Batalha de Equipes, Corrida dos Escorpiões e Jogo do Silêncio. Cada um mantém mapa e cena-modelo próprios; a preparação de combate de maior profundidade segue priorizada para o Duelo e a Batalha.

## Esforço estimado

| Frente | Estado | Esforço |
|---|---|---:|
| Identidade visual e banner | implementado nesta atualização | 1/5 |
| Dossiê privado | implementado nesta atualização | 1/5 |
| Inscrição, retrato e apostas do jogador | já implementado; refinamento visual aplicado | 2/5 |
| Elenco, tags, Actors e Tokens | circuito e ponte prontos; criação depende do módulo Criador no servidor | 3/5 |
| Provas automáticas e presets | implementado para Duelo/Batalha; Corrida/Silêncio catalogados | 2/5 |
| Mapas e cenas | assets e cenas-modelo prontos; servidor remoto ainda precisa importar a atualização | 2/5 |
| Sorteio visual do Duelo | catalogado, aguardando API do módulo de tabelas | 4/5 |
| Inscrição temporária por visita | não migrada para não destruir cadastros | 3/5 |
