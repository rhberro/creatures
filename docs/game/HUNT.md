# Caçada

Este documento cobre a atividade de caça: o que acontece quando o treinador está em uma área de caça.

> Este documento cobre **a atividade em si**. Como o jogador escolhe a área está em [Seleção de Área de Caça](HUNT_AREA_SELECT.md), os detalhes de cada área estão em [Detalhes da Área de Caça](HUNT_AREA_DETAILS.md), e o que o jogador pode fazer na cidade está em [Cidade](CITY.md). A stamina do treinador, que limita a duração da caçada, está em [Treinador](TRAINER.md).

## Visão Geral

A caçada é a atividade principal do jogo. O treinador está em uma área de caça, com suas criaturas, e encontra criaturas selvagens lá.

> O que exatamente existe aqui dentro da área ainda é escopo das fases alfa e beta e será definido. Este documento está escrito só com as regras já decididas.

## Entrar na Caçada

O jogador entra em uma caçada pelo drawer de [detalhes da área](HUNT_AREA_DETAILS.md#iniciar-caçada): seleciona a área, espera os 5 segundos e a caçada começa.

A entrada só termina quando a área está carregada: depois da contagem, a [tela de carregamento](PLAY_SCREEN.md#estados-da-tela) fica visível até a caçada estar pronta para ser renderizada.

A entrada sempre acontece a partir da cidade. O [modal de seleção](HUNT_AREA_SELECT.md) só é acessível pelo [botão de play](PLAY_SCREEN.md#botão-de-play), que existe apenas na cidade, então não há como iniciar uma caçada — nem trocar de área — no meio de outra caçada.

## Trocar de Área

Trocar de área não acontece durante a caçada. Como o [modal de seleção](HUNT_AREA_SELECT.md) só é acessível pelo [botão de play](PLAY_SCREEN.md#botão-de-play), que existe apenas na cidade, o jogador que está caçando não tem acesso à lista de áreas.

Para trocar de área, ou para reiniciar a caçada na mesma, o jogador precisa primeiro sair da caçada atual. De volta à cidade, ele abre o modal, escolhe a área — que pode ser a mesma onde estava — e inicia a caçada pelo [fluxo de sempre](#entrar-na-caçada).

> A troca e o reinício são a mesma ação: começar uma caçada. O que muda é só a área escolhida, e não vale uma regra própria para cada caso.

> O jogador encerra a caçada pelo botão **Finalizar Caçada**, no painel da sessão do [analisador de caçada](HUNT_ANALYZER.md), e só então escolhe a próxima área.

## Fim da Caçada

A caçada é finalizada automaticamente em três situações:

- A [stamina](TRAINER.md#stamina) do treinador chega a zero.
- A [sessão offline](TRAINER.md#sessão-offline) da conta se esgota, mesmo com stamina sobrando.
- O [time](TRAINER.md#time) do treinador não tem mais nenhuma criatura apta a batalhar.

Nas três situações o treinador volta para a [cidade](CITY.md), e a caçada só recomeça se o jogador entrar em uma área de novo. A volta passa pela [tela de carregamento](PLAY_SCREEN.md#estados-da-tela), como qualquer entrada em uma área.

O jogador também pode finalizar a caçada quando quiser, pelo botão **Finalizar Caçada** no painel da sessão do [analisador de caçada](HUNT_ANALYZER.md): a caçada passa pela mesma contagem de 5 segundos e pela [tela de carregamento](PLAY_SCREEN.md#estados-da-tela), e o treinador volta para a cidade.

> Nas três situações acima o fim vem do jogo, e não de uma ação do jogador. Finalizar a caçada é a escolha do jogador, e o que acontece com os itens obtidos nela ainda está em aberto, nas [pendências](#pendências).

## Áreas de Caça

Cada área de caça tem suas próprias criaturas e itens, descritos nos [detalhes da área](HUNT_AREA_DETAILS.md).

## Escopo das Fases Alfa e Beta

Os pontos abaixo ainda estão em aberto ou são provisórios nesta fase e devem ser revistos conforme o jogo evolui:

- A lista de criaturas e itens de cada área ainda não foi definida.

## Pendências

Os pontos abaixo ainda não foram decididos:

- O que acontece com os itens obtidos quando o jogador finaliza a caçada.
- O que é renderizado no canvas durante a caçada, incluindo vida, inimigos e o loot.