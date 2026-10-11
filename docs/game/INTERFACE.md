# Interface

Este documento cobre as convenções de interface do jogo: os comportamentos que os elementos da tela compartilham, como popup, tamanho de modais e barra de rolagem.

> Este documento cobre **a interface como um todo**. A tela do jogo e seus elementos estão em [Tela do Jogo](PLAY_SCREEN.md), e cada superfície — [mochila](BACKPACK.md), [armazenamento](STORAGE.md), [analisador de caçada](HUNT_ANALYZER.md) e as demais — tem documento próprio. Cada superfície descreve o que ela exibe; aqui fica como esses elementos se comportam.

## Visão Geral

A interface do jogo é uma só, para desktop e celular. O conteúdo é o mesmo em qualquer tamanho de tela, e o que muda é o tamanho dos elementos dentro de um limite, em vez de uma versão separada para cada dispositivo.

Cada superfície tem as suas regras no documento dela, e aqui ficam as convenções que elas compartilham. Novas convenções entram neste documento conforme forem definidas.

## Popup

O popup é o elemento que mostra informações de um item, de uma criatura ou de outro conteúdo. Ele segue o mesmo comportamento em qualquer superfície.

O hover exibe o popup, e ele some quando o cursor sai do elemento. O clique no elemento mantém o popup aberto: ele continua visível mesmo sem o cursor sobre ele, até o jogador clicar em outro lugar.

> O popup funciona nos dois formatos de tela. No desktop, o hover mostra o popup e tirar o cursor o esconde, sem clique nenhum. No celular, onde não existe hover, o clique no elemento mostra o popup e ele fica aberto até o jogador clicar em outro lugar, então ele lê a informação sem precisar segurar o toque em nenhum lugar da tela.

## Tamanho Fixo

Modais e drawers têm tamanho fixo: depois de abertos, eles não mudam de altura nem de largura por causa do conteúdo. A única escala que existe é a da tela, para caber em telas menores.

> O tamanho fixo existe para a interface não pular debaixo do jogador. Uma lista que muda o tamanho do modal a cada item mexe no que está ao redor e faz o jogador perder o lugar do clique.

## Barra de Rolagem

As áreas roláveis mostram a barra de rolagem sempre visível, mesmo quando o conteúdo cabe na tela.

> A barra sempre visível é preferível a aparecer e sumir: a barra que só aparece quando precisa muda a largura do conteúdo e faz o layout piscar. Com ela sempre presente, o jogador vê a mesma tela com ou sem rolagem.

## Pendências

Os pontos abaixo ainda não foram decididos:

- Os valores de tamanho mínimo e máximo da escala da interface.
- A cor de destaque dos elementos ativos.
