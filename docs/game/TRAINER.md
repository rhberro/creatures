# Treinador

Este documento cobre o treinador como personagem do jogador dentro do jogo: seu nível, sua stamina, seu time de criaturas e onde ficam as criaturas que não estão no time. São regras do treinador, que valem em qualquer lugar, na cidade ou em uma caçada.

> Este documento cobre **o treinador em jogo**. Como o treinador é criado e selecionado no nível da conta está em [Autenticação](AUTHENTICATION.md). A tela onde ele é acompanhado está em [Tela do Jogo](PLAY_SCREEN.md), e a atividade que consome a stamina dele está em [Caçada](HUNT.md).

## Nível

O treinador tem o próprio nível, exibido na [toolbar da tela do jogo](PLAY_SCREEN.md#treinador).

O nível do treinador sobe apenas completando missões e missões diárias. Batalhas não dão experiência ao treinador.

> O nível do treinador não tem relação com o nível das criaturas, que é individual de cada criatura. São duas progressões separadas: a do personagem do jogador e a das criaturas.

## Stamina

A stamina é o tempo de caça do treinador. Ela é medida em horas, e o máximo é **12 horas**, para todo e qualquer treinador.

A stamina máxima é sempre 12 horas. Nenhum item, habilidade ou situação aumenta ou diminui esse valor.

> Um número único e imutável existe para o jogo ter uma regra só. Enquanto o treinador tem stamina, ele pode caçar; quando ela acaba, ele para. Nenhum jogador tem tempo de caça extra por item ou por construção de personagem.

### Recuperação

A stamina recupera sempre que o treinador não está caçando. Estar na cidade, com o jogo aberto ou desconectado não faz diferença: o que bloqueia a recuperação é apenas estar em uma caçada.

A velocidade da recuperação depende do tipo de conta:

- **Conta gratuita:** 1 minuto de stamina a cada 2 minutos.
- **Conta paga:** 1 minuto de stamina a cada 1 minuto.

### Consumo

Cada minuto de caçada consome 1 minuto de stamina, com o jogo aberto ou não. A stamina não é um banco de horas de caça offline: ela é consumida do mesmo jeito com o treinador online ou caçando sozinho.

Enquanto caça, o treinador não recupera stamina. A recuperação só acontece entre caçadas.

### Mínimo para Caçar

Iniciar uma caçada exige pelo menos **30 minutos** de stamina. Um treinador pode estar caçando com menos do que isso — a caçada começa com 30 minutos ou mais e consome até acabar —, mas não pode começar uma nova com menos.

> A regra vale para qualquer início de caçada, sem exceção: entrar em uma área nova, [trocar de área](HUNT.md#trocar-de-área) e reiniciar na mesma área passam pelo mesmo mínimo.

### Sessão Offline

A caçada começada continua mesmo se o jogador fechar o jogo. Ela segue sozinha até o fim da sessão offline, cuja duração depende do tipo de conta:

- **Conta gratuita:** 4 horas de caçada seguidas.
- **Conta paga:** 8 horas de caçada seguidas.

Quando o tempo da sessão acaba, a caçada é finalizada automaticamente, mesmo que ainda haja stamina disponível. Para caçar de novo, o jogador precisa conectar no jogo e iniciar a caçada novamente.

### Por Treinador

A stamina é do treinador, não da conta. Cada treinador tem a sua própria stamina de 12 horas, e usar a de um não afeta a dos outros: o jogador pode zerar a stamina de um treinador e em seguida começar a caçar com outro.

O tipo de conta é da conta, e não do treinador. A velocidade de recuperação e a duração da sessão offline valem para todos os treinadores da conta.

## Time

O treinador carrega consigo no máximo **5 criaturas**. O time é exibido nas [linguetas da tela do jogo](PLAY_SCREEN.md#linguetas-do-time).

### Fora da Caçada

Fora de uma caçada, na cidade, o treinador pode remanejar o time à vontade: adicionar criaturas, remover criaturas e trocar. A ordem do time também pode ser alterada, e é ela que define quem entra em campo quando uma criatura desmaia.

### Durante a Caçada

Durante a caçada o time está fechado: o time que o treinador entra é o time que ele sai. Fora de uma exceção, ele não adiciona nem remove criaturas do time.

A exceção é a captura. Se existe um slot disponível, a criatura capturada entra direto no próximo slot vago do time, em vez de ir para o [armazenamento](#armazenamento). Um treinador pode entrar em uma caçada com 3 criaturas, capturar duas durante ela e sair com 5, preenchendo os slots 4 e 5.

> A exceção existe porque reabrir o time no meio da caçada daria ao jogador a chance de consertar um time perdido sem custo nenhum. Um slot vago, porém, é espaço que já existia quando a caçada começou, e ocupá-lo não é remanejo.

Com o time cheio, qualquer criatura capturada vai para o [armazenamento](#armazenamento) automaticamente.

## Criaturas Desmaiadas

Uma criatura desmaiada não entra mais em batalha, e o slot dela é exibido em tons de cinza com opacidade reduzida, para o jogador perceber de longe.

### Entrada Automática

Quando a criatura ativa desmaia, a primeira criatura apta, da esquerda para a direita, entra automaticamente no lugar dela, sem espera.

> A troca automática não tem os 5 segundos da troca manual. Ela não é uma escolha do jogador e sim a continuidade da caçada: se a criatura que entrou desmaiar 1 segundo depois, a próxima entra também sem espera.

> A ordem do time é o que decide a prioridade de entrada. Quem quer que a criatura C seja a primeira e que a A entre quando ela desmaiar deixa o time na ordem C, A, B.

Se não existir mais nenhuma criatura apta no time, a caçada é finalizada automaticamente e o treinador volta para a [cidade](SAFE_AREAS.md).

### Troca Manual

O jogador pode clicar em qualquer criatura apta do time, em qualquer posição, para colocá-la no lugar da criatura ativa. A criatura clicada e a criatura ativa trocam de lugar. Clicar em uma criatura desmaiada não faz nada.

Para evitar spam, depois de uma troca manual qualquer nova troca fica bloqueada por **5 segundos**, para qualquer criatura. Enquanto a criatura A está em campo e o jogador clica na criatura B, elas trocam na hora, mas voltar para a A ou ir para uma C exige esperar os 5 segundos.

> A máscara com a contagem sobre os slots faz parte da [tela do jogo](PLAY_SCREEN.md#troca-de-criatura), e existe para o jogador entender que a troca está em espera, e não impedida por um erro.

> A troca é a única coisa que o jogador faz com o time durante uma caçada, além de receber criaturas capturadas em slots vagos. Adicionar, remover e reordenar criaturas não acontecem nos slots: os slots são para clicar e para acompanhar o estado das criaturas.

## Armazenamento

O armazenamento é onde ficam as criaturas capturadas que não estão no time, quando o time já está cheio.

O nome é provisório. No futuro o armazenamento pode ser um computador ou qualquer outra coisa, e o comportamento continua o mesmo: criaturas que não estão no time ficam guardadas.

O jogador pode consultar o armazenamento de qualquer lugar, caçando ou não, para acompanhar as criaturas que capturou sem precisar voltar para a [cidade](SAFE_AREAS.md).

> A consulta de qualquer lugar existe porque sair da caçada para ver as criaturas seria punir o jogador por querer informação. A interface do armazenamento será documentada em um documento próprio quando o menu for definido.

## Escopo das Fases Alfa e Beta

Os pontos abaixo ainda estão em aberto ou são provisórios nesta fase e devem ser revistos conforme o jogo evolui:

- As missões e missões diárias, que dão experiência ao treinador, ainda não existem, então por enquanto o nível do treinador não sobe.
- O armazenamento ainda não tem interface.

## Pendências

Os pontos abaixo ainda não foram decididos:

- O que o nível do treinador libera.
- Onde a stamina do treinador é exibida na interface.
- Se existe limite de criaturas no armazenamento.
- Se a criatura que entra no lugar da desmaiada muda de posição no time.
