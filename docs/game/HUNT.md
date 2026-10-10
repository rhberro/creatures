# Caçada

Este documento cobre a atividade de caça: o que acontece quando o treinador está em uma área de caça.

> Este documento cobre **a atividade em si**. Como o jogador escolhe a área está em [Seleção de Área de Caça](HUNT_AREA_SELECT.md), os detalhes de cada área estão em [Detalhes da Área de Caça](HUNT_AREA_DETAILS.md), e o que o jogador pode fazer nas áreas seguras está em [Áreas Seguras](SAFE_AREAS.md). A stamina do treinador, que limita a duração da caçada, está em [Treinador](TRAINER.md).

## Visão Geral

A caçada é a atividade principal do jogo. O treinador está em uma área de caça, com suas criaturas, e encontra criaturas selvagens lá.

> O que exatamente existe aqui dentro da área ainda é escopo das fases alfa e beta e será definido. Este documento está escrito só com as regras já decididas.

## Entrar na Caçada

O jogador entra em uma caçada pelo drawer de [detalhes da área](HUNT_AREA_DETAILS.md#iniciar-caçada): seleciona a área, espera os 5 segundos e a caçada começa.

A entrada funciona da mesma forma em qualquer situação, sem exceção: tanto quando o jogador está em uma cidade ou em outra área segura, quanto quando já está no meio de outra caçada.

## Trocar de Área

O jogador pode trocar de área durante a caçada, abrindo o [modal de seleção](HUNT_AREA_SELECT.md) e escolhendo outra área.

A troca passa pelos mesmos 5 segundos de espera, e a caçada atual é encerrada para começar na nova área.

> A troca não é uma ação diferente de iniciar uma caçada. O jogador sai de onde está e entra em outro lugar, e é o mesmo fluxo com a mesma espera.

## Reiniciar a Caçada

O jogador pode selecionar a área em que já está caçando, e a caçada é reiniciada nela.

> A regra completa está em [Iniciar Caçada](HUNT_AREA_DETAILS.md#iniciar-caçada).

## Fim da Caçada

A caçada é finalizada automaticamente em três situações:

- A [stamina](TRAINER.md#stamina) do treinador chega a zero.
- A [sessão offline](TRAINER.md#sessão-offline) da conta se esgota, mesmo com stamina sobrando.
- O [time](TRAINER.md#time) do treinador não tem mais nenhuma criatura apta a batalhar.

Nas três situações o treinador volta para a [cidade](SAFE_AREAS.md), e a caçada só recomeça se o jogador entrar em uma área de novo.

> Nas três situações o fim vem do jogo, e não de uma ação do jogador. Como o jogador encerra a caçada por vontade própria ainda está em aberto, nas [pendências](#pendências).

## Áreas de Caça

Cada área de caça tem suas próprias criaturas e itens, descritos nos [detalhes da área](HUNT_AREA_DETAILS.md).

## Escopo das Fases Alfa e Beta

Os pontos abaixo ainda estão em aberto ou são provisórios nesta fase e devem ser revistos conforme o jogo evolui:

- A lista de criaturas e itens de cada área ainda não foi definida.

## Pendências

Os pontos abaixo ainda não foram decididos:

- O que o jogador vê durante o carregamento da área, depois da contagem de 5 segundos.
- Como o jogador encerra a caçada e o que acontece com os itens obtidos nela.
- O que é renderizado no canvas durante a caçada, incluindo vida, inimigos e o loot.