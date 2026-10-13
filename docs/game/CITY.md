# Cidade

Este documento cobre a cidade, a área segura do jogo: o único lugar sem batalhas, onde o treinador anda livremente, vê outros jogadores e resolve a vida dele — cura, compra e venda.

> Este documento cobre **a cidade**. As regras do treinador estão em [Treinador](TRAINER.md), a atividade que acontece fora dela está em [Caçada](HUNT.md), e a tela de onde a cidade faz parte é a [Tela do Jogo](PLAY_SCREEN.md).

## Visão Geral

A cidade é a área segura do jogo. Nas fases alfa e beta ela é a única área segura, e é para ela que o treinador volta quando uma caçada acaba.

A cidade é o único lugar do jogo onde o treinador anda livremente com o personagem, por clique no chão, WASD ou pelas setas do teclado. Na caçada o personagem é automatizado: as batalhas acontecem sozinhas e o treinador não caminha pelo mapa.

> A cidade é o oposto da caçada no que depende do jogador. Na caçada tudo acontece sozinho; na cidade tudo depende do jogador. Onde já se usou o termo safe zone, leia cidade.

## Sem Nada Automático

Na cidade não acontecem batalhas e nenhuma atividade roda sozinha. Fechar a aba ou o navegador com o treinador na cidade apenas o desconecta: não existe nada para continuar rodando sem ele.

> A caçada é a única atividade que continua sozinha, até o fim da [sessão offline](TRAINER.md#sessão-offline) da conta, consumindo stamina normalmente. Na cidade não existe equivalente: o treinador desconectado é um treinador parado, e o jogo não segue por ele.

> A stamina não fica de fora: ela continua recuperando com o treinador na cidade, conectado ou não, porque a recuperação é o passar do tempo e não uma atividade. A regra completa está em [Recuperação](TRAINER.md#recuperação).

## Outros Jogadores

A cidade é o único lugar onde o jogador vê outros jogadores. Os treinadores de outras contas que estão na cidade aparecem andando livremente pelo mapa, cada um com o seu personagem.

> A cidade junta os jogadores justamente porque é o lugar sem batalha: encontrar outros treinadores sem risco de luta faz da cidade o ponto de encontro do jogo.

> O que o jogador pode fazer com os outros ainda não foi decidido: ver os outros andando é a base, e a interação entre eles vem depois. Quantos jogadores a cidade suporta não é regra do jogo e sim decisão técnica, de instâncias, que será tratada na parte técnica.

## Pontos de Interação

A cidade tem pontos de interação: locais do mapa onde o jogador aproxima o personagem e interage com um NPC, por conversa ou por clique. Por enquanto existe o local de cura, e a loja entra com as fases alfa e beta.

### Local de Cura

O local de cura resolve o time do treinador de uma vez, de graça: sem gastar itens de cura nem habilidades de cura da criatura. As criaturas feridas voltam a 100% de vida, e as desmaiadas são revividas, também com 100% de vida.

A ação é instantânea e não tem cooldown: se o time desmaiar de novo na próxima caçada, o jogador pode voltar e reviver a hora que quiser. O botão de reviver fica desabilitado quando não existe nenhuma criatura desmaiada, e é essa desabilitação que evita o spam de cliques.

Nas fases alfa e beta a cidade tem um único local de cura.

> A cura grátis existe para o jogador nunca ficar preso. Um time desmaiado é o fim de uma caçada, e voltar para a cidade com um ponto de cura garante que ele continue jogando sem gastar nada do que juntou caçando. Reviver as criaturas é justamente o motivo principal do ponto existir.

> Itens e habilidades de cura existem para a caçada, onde não existe esse ponto.

## Lojas

Nas fases alfa e beta a cidade tem uma loja de NPC. O jogador compra o básico — consumíveis e dispositivos — e vende o loot de criaturas. O que ele compra vai direto para a [mochila](BACKPACK.md), e o item vendido deixa de existir: ele sai da mochila e não volta.

A moeda do jogo é o **gold coin**, e por enquanto a única forma de ganhar gold coins é vendendo loot na loja. Criatura não dropa gold coin: o que uma criatura selvagem deixa são as partes e os itens que ela carrega, conforme as regras de [drop](HUNT.md#áreas-de-caça).

> O diamante, a outra moeda do jogo, não passa por aqui: ele vem de doações e compra serviços, conforme as [moedas](TRAINER.md#moedas).

Compra e venda acontecem no mesmo modal, a [loja](STORE.md), e não pela mochila, que é só de consulta.

> A loja é o destino do loot: o item dropado na caçada só se transforma em algo quando é vendido na cidade, e o que o jogador quiser guardar fica na [mochila](BACKPACK.md). Comprar e vender são duas abas do mesmo modal, e é por isso que a loja mora na cidade e não em outro lugar.

Mais tarde a cidade ganha lojas especializadas, o mercado e NPCs de outras funções.

## Escopo das Fases Alfa e Beta

Os pontos abaixo ainda estão em aberto ou são provisórios nesta fase e devem ser revistos conforme o jogo evolui:

- Mais de um local de cura só se a necessidade aparecer, e as lojas vão se especializar mais tarde, com o mercado e outros NPCs.
- Os outros jogadores aparecem andando, mas a interação entre eles ainda não existe.

## Pendências

Os pontos abaixo ainda não foram decididos:

- O que o jogador pode fazer com os outros jogadores que vê na cidade.
