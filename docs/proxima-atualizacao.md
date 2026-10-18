# Inscrições e colaboração — v0.9.0

Fluxo: mestre publica o Teatro → jogador abre Inscrição e equipes → seleciona seu personagem e classe → paga uma única taxa de 10 pilas → cria equipe ou aceita convite → solicita vaga em uma prova aberta → aposta pilas ou itens.

A identificação usa o autor persistido da mensagem do Foundry e a permissão OWNER do Actor. Somente um mestre ativo processa solicitações. Retratos e inventário vêm da própria ficha; o saldo mostrado é o de pilas, sem converter automaticamente trocados ou kurmacs.

Apostar item requer preço positivo, quantidade disponível e equipamento desequipado e desvinculado. O preço registrado na ficha é aceito em pilas pela Casa. A quantidade sai de circulação e permanece registrada no bilhete; em vitória ela volta e o lucro é pago em pilas; em anulação ela volta; em derrota fica com a Casa. Não apague a ficha do item enquanto a aposta estiver pendente. Itens narrativos sem valor mecânico não são aceitos. Prêmios fracionários exigem conversão pelo mestre.

Inscrição em uma prova é uma solicitação de vaga; o mestre define os lados e monta a escalação no card da prova. Personagens de jogadores precisam do cadastro do Coliseu para entrar na arena. Equipes sociais não têm limite fixo: o limite de participantes é o da prova.

NPCs sociais usam ficha character sem proprietário jogador. O tipo npc do sistema Skyfall significa Ameaça e não é permitido como patrocinador. Ameaças continuam disponíveis para escalação pelo mestre nas provas.

Os 40 modelos continuam em Elenco. Instalar circuito inicial aparece somente antes da primeira instalação. Depois o botão é Criar / sincronizar fichas do elenco, com contagem de vínculos. Apostadores, equipes e bastidores mostram as fichas vinculadas; origem e notas não entram na publicação.

Próxima etapa catalogada: sorteios visuais do Duelo do Anel, integração ao módulo de tabelas e apresentação passo a passo do regulamento. A integração ainda depende da identificação da API do módulo de tabelas instalado. Mapas sempre em vista ortogonal vertical, 100% de cima.

Validação: testes de propriedade, taxa única, convites, apostas financeiras, custódia e devolução de item, além do fluxo de interface em host simulado. A publicação da versão não instala nem testa o mundo do Foundry Server remoto.
