# QUEDAÇO — Teatro dos Condenados

Módulo de campanha para Foundry VTT 13 e Skyfall RPG. O Coliseu de Kravokia é uma dimensão de bolso: áreas de convivência conectam portais para as arenas. Conteúdo autoral, não uma declaração de cânone do cenário.

**Versão 0.12.0.** Manifesto para instalar ou atualizar pelo Foundry Server: https://github.com/yurisatelite/quedaco-teatro/releases/latest/download/module.json. Publicar a versão não instala a atualização automaticamente no servidor.

## Fluxo enxuto

Somente **Duelo do Anel** começa disponível. As outras modalidades permanecem na gaveta de jogos desativados; registros e mapas antigos são preservados. O Dossiê é a última opção e fica reservado ao mestre. Praça das Caravanas, mercado e guichês são referências narrativas do espaço central, não mapas exploráveis prontos.

Abra pelo botão do Teatro no diretório de diários, pela ferramenta de máscaras ou pela macro `game.modules.get('quedaco-teatro').api.openTheatre()`.

1. Prepare as fichas e imagens, se necessário, no Dossiê.
2. Em **Equipes**, abra um card para editar integrantes. O card verde cria uma equipe nova.
3. Em **Provas**, escolha os duelistas diretamente ou use equipes com NPCs vinculados. É possível gerar de uma a quatro provas de NPCs.
4. Publique com **Mostrar para os jogadores**. Jogadores inscritos podem apostar em **Minhas apostas**.
5. Encerre apostas e conduza a prova na mesa ou use **Sortear e finalizar** nas simulações.
6. A prova encerrada sai da programação ativa e fica em **Provas finalizadas**. Os jogadores consultam e resgatam seus bilhetes.

## Equipes e inscrições

Cards verticais recolhíveis mostram escudo, membros, patrocínio, vitórias e derrotas. Cada equipe aceita até cinco pessoas. Equipes antigas que já excedam esse limite não perdem membros automaticamente; o mestre deve ajustar a composição antes de adicionar alguém. As equipes de NPCs recebem uma campanha inicial fictícia de vitórias e derrotas, gerada uma vez; novas equipes começam em zero. Fama fica guardada nos dados, mas oculta e sem controles.

A classe é lida do Item de classe da ficha Skyfall, inclusive para inscrições antigas. Não há mais um papel independente no Coliseu. Se não houver classe, ajuste a ficha. Ameaças não aparecem como candidatos. Jogadores podem formar equipes entre si; equipes de NPCs só aceitam jogadores quando o mestre habilita a opção.

O mestre pode remover um integrante, excluir uma equipe ou remover a inscrição de uma pessoa. Isso **não apaga Actors nem bilhetes**. Participantes/equipes de provas abertas precisam ter essas provas finalizadas ou anuladas primeiro. Remover apenas um membro da equipe mantém sua inscrição no Coliseu.

A inscrição cobra 10 pilas do campo `system.currency.p`, com mestre conectado e validação de propriedade. A marca de pagamento permanece no Actor: nesta versão ainda é uma taxa única por personagem, não uma cobrança por visita. Fechar a janela não cancela a inscrição. Trocados e kurmacs não são convertidos automaticamente.

## Apostas

Novas apostas são somente em dinheiro: valores inteiros de **1 a 100 pilas**, limitados também ao saldo real. Há atalhos de 10, 20, 50 e 100, e o retorno exibido inclui a entrada: apostar 10 a 2× retorna 20 se vencer. A cotação fica fixada no bilhete. Bilhetes antigos de itens continuam resgatáveis, mas novas apostas de itens estão desativadas.

Ao aderir às apostas, o jogador é informado de que seu saldo ficará visível aos demais jogadores. O caixa, as dívidas, a origem e os segredos dos apostadores NPCs são privados do mestre. Seus caixas são narrativos, separados do dinheiro dos Actors, e recebem reposição quando necessário para continuar participando.

O resgate exige propriedade da ficha e um mestre conectado. A identificação de pagamento evita resgates repetidos. Bilhetes continuam acessíveis depois de remover a inscrição do personagem. Anular uma prova devolve as apostas conforme o fluxo de liquidação/resgate.

## Duelo do Anel

Escolha dois personagens diferentes: NPCs ou jogadores inscritos, sem obrigação de pertencer a uma equipe. Jogadores só participam do modo **Na mesa**. A predefinição preenche regras e prêmio; o mestre pode ajustar antes de anunciar.

É possível editar participantes antes de preparar a Cena. A edição devolve entradas de apostas automáticas dos NPCs e refaz esses bilhetes quando as apostas estão abertas. Se houver uma aposta de jogador ou avulsa pendente, anule a prova e crie outra para não mudar o confronto depois do pagamento.

**Montar Anel, Tokens e iniciativa** cria a Cena da prova, posiciona duelistas e monta o Combate. O combate real continua sendo conduzido pelo mestre e pelo sistema Skyfall. O mapa tático tem visão de cima; arte de entrada/portal é uma imagem narrativa separada.

Simulações dispensam Cena e geram vencedor, placar e motivo narrativo. O sorteio usa chances iguais entre os lados, sem fama. Não é um simulador mecânico de combate Skyfall e não gasta recursos das fichas. Resultados de provas já encerradas são preservados.

## Fichas, retratos e vendedores

No **Dossiê → Preparar fichas e imagens · Mestre**, use a opção de aplicar modelos com o **QUEDAÇO — Personagens Skyfall RPG** ativo. O circuito contém 44 modelos: 16 competidores, 16 apostadores, oito pessoas de bastidor e quatro vendedores. O Criador valida os compêndios antes de gravar Actors; modelos já vinculados não são duplicados. Os registros usam tags estáveis, não só o nome.

Depois de criar, procure **Actors → Teatro dos Condenados**, com pastas de Equipes, Apostadores e Bastidores. Arraste fichas desse diretório para a Cena. Os cards vinculados permitem abrir a ficha.

Para fichas já criadas, há uma ação de **atualizar imagens do circuito**: substitui apenas retratos/texturas ausentes, genéricos ou a antiga imagem compartilhada, incluindo Tokens colocados nas Cenas. Imagens personalizadas são preservadas. Os 44 arquivos individuais vêm do acervo local fornecido pelo usuário.

Os retratos são ilustrativos. Esta atualização não redesenhou os modelos mecânicos antigos: eles ainda usam o preset validado de Anuro/Bufonin e Combatente/Militar. Histórias e pertences narrativos são próprios, mas não equivalem a 44 construções mecânicas distintas. Revisar classe, ancestralidade e equipamentos mecânicos continua sendo uma etapa editorial separada; não se sobrescrevem fichas existentes para adaptá-las à arte.

Vendedores no Dossiê: **Safira do Odre** (água e provisões), **Dara Rebite** (manutenção), **Ilen Folha-Seca** (higiene e curativos) e **Nilo dos Ecos** (mensagens e lembranças). Têm antecedentes, segredos e ofertas com preços sugeridos. Compras, entrega de itens e eventual cura são conduzidas manualmente pelo mestre.

## Privacidade e atualização

O JournalEntry de direção é privado. O cartaz público recebe apenas campos explicitamente selecionados; o Dossiê, os NPCs apostadores e notas privadas não são publicados. Não conceda aos jogadores acesso ao diário de direção. Como em qualquer conteúdo distribuído, textos originais dentro dos arquivos do módulo podem ser inspecionados; isso não concede acesso às notas privadas do mundo.

**Mostrar para os jogadores** publica o cartaz. Novas inscrições e apostas atualizam seus dados; encerrar apostas ou finalizar a prova atualiza o resultado quando há apresentação ativa. Outras mudanças de preparação podem exigir publicar novamente. **Fechar apresentação** retira o cartaz, mas não desfaz o que alguém já viu.

Faça backup do mundo antes de aplicar uma atualização. Escritas são serializadas por cliente e revisões detectam formulários antigos, mas não há trava transacional entre mestres em computadores diferentes: use um mestre responsável por vez.

## Verificação local

- `npm test`: testes de regras, projeções públicas, dinheiro, fichas, equipes e migrações.
- `npm run test:ui`: interface real do módulo em um host Foundry **simulado**, usando Playwright/Edge disponível em `../quedaco-campanhas`; capturas em `output/`.
- `npm run package`: produz `dist/quedaco-teatro.zip` e o manifesto local.

O manifesto mantém o alvo Foundry 13 do projeto. Os testes locais não substituem a validação no servidor real com contas de mestre e jogador e os compêndios Skyfall instalados. Esta atualização não foi aplicada ao servidor remoto.
