# Tela do Jogo

Este documento cobre a tela principal do jogo, onde o jogador acompanha e controla o treinador, desde a estrutura geral e os elementos que ficam sempre visíveis até os estados de conexão e o comportamento em dispositivos móveis.

> A **tela do jogo** é composta por um **canvas**, que renderiza o mundo do jogo, e por elementos HTML sobrepostos a ele, como a toolbar, as linguetas do time e a barra de habilidades. O que é renderizado dentro do canvas (mapa, criaturas, vida, chat, informações do alvo etc.) é tema de um documento próprio, assim como cada modal e menu aberto a partir dessa tela.

## Visão Geral

O jogo é em pixel art e visto de cima (top down), inspirado em Pokémon do GBA e em Tibia, com mais foco nas criaturas. É um jogo idle, pensado para ser aberto e acompanhado a qualquer momento, em desktops e celulares.

> Toda a simulação do jogo acontece no serviço. O cliente envia comandos, o serviço valida e processa, e devolve o resultado para o cliente renderizar. A tela do jogo nunca decide nada por conta própria.

O acesso a essa tela é feito pela [tela de lista de treinadores](autenticacao.md#tela-de-lista-de-treinadores), ao entrar com um treinador, e é uma tela protegida, conforme o [controle de acesso](autenticacao.md#controle-de-acesso).

## Estrutura da Tela

A tela é dividida em três partes: a toolbar, o canvas e os elementos sobrepostos ao canvas.

- **Toolbar:** fixa no topo, ocupa 100% da largura da tela.
- **Canvas:** ocupa 100% da largura e todo o restante da altura, abaixo da toolbar.
- **Elementos sobrepostos:** as linguetas do time e a barra de habilidades ficam por cima do canvas.

> A toolbar não fica sobre o canvas: ela ocupa o próprio espaço e o canvas começa logo abaixo, então nenhuma parte dele fica escondida. Já os elementos sobrepostos ficam por cima do canvas, que continua ocupando toda a sua área.

Nenhum elemento HTML da tela, incluindo os modais abertos a partir dela, pausa ou bloqueia o canvas. A simulação segue rodando com ou sem modais abertos, e o que o jogador pode fazer em cada momento depende só do que está acontecendo no jogo, como estar em uma cidade ou em uma batalha.

## Toolbar

Barra no topo da tela, dividida em três áreas: treinador à esquerda, menu central e menu da direita, mais ou menos assim: ```| Treinador ---------- Menu Central ---------- Menu Direita |```.

### Treinador

No canto esquerdo vamos exibir o avatar do treinador, e ao lado dele o nome, com o nível logo abaixo.

### Menu Central

Uma área centralizada com botões de acesso às funcionalidades do jogo. Por enquanto, o primeiro botão é o de **Hunting Areas**, que abre um modal para o jogador escolher os locais de caça. Os demais botões são placeholders para funcionalidades que ainda serão definidas.

### Menu da Direita

Uma área alinhada à direita, também com botões de acesso. O último botão, na extrema direita, é o de **Settings**, o menu principal do jogo, com as configurações e outras opções. Os demais botões são placeholders para funcionalidades que ainda serão definidas.

> Dentro do menu Settings vamos exibir a opção "Trocar treinador", que desconecta o treinador do serviço e leva o jogador de volta para a [tela de lista de treinadores](autenticacao.md#tela-de-lista-de-treinadores), e a opção "Sair", que encerra a sessão conforme descrito na [sessão](autenticacao.md#sessão). Veja o comportamento da desconexão em [conexão e atividade idle](#conexão-e-atividade-idle).

## Linguetas do Time

Logo abaixo da toolbar, centralizadas e sobre o canvas, ficam as linguetas que representam o time do treinador, com no máximo 5 criaturas.

- **Slot preenchido:** lingueta maior, que exibe o avatar, o nome e o nível da criatura.
- **Slot vazio:** lingueta menor, sem informações, indicando que ainda há espaço no time.

> A lingueta da criatura ativa é destacada em vermelho. Se o treinador estiver em uma batalha, é a criatura que está em campo. Se estiver fora de uma batalha, em uma cidade por exemplo, é a criatura que será chamada assim que uma batalha começar.

> A vida da criatura não é exibida na lingueta, pois já é renderizada no canvas. Se a criatura estiver desmaiada, o avatar dela é exibido em tons de cinza e com opacidade reduzida.

## Barra de Habilidades

Barra na parte inferior da tela, centralizada e sobre o canvas, com 6 slots: 4 habilidades da criatura ativa, 1 item de cura e 1 dispositivo de captura. Por meio dela o jogador acompanha o que está sendo usado e o tempo de recarga (cooldown) de cada habilidade.

> As habilidades exibidas são as da criatura ativa, então os 4 primeiros slots mudam quando a criatura ativa muda. Uma criatura pode ter muito mais habilidades do que as 4 equipadas, e como equipá-las será descrito em um documento próprio.

## Responsividade

O jogo precisa rodar bem em celulares e desktops, em qualquer tamanho de tela, e os elementos da tela se adaptam ao espaço disponível. Os detalhes de como a toolbar, as linguetas e a barra de habilidades se comportam em telas pequenas serão definidos junto com o design da interface.

### Orientação

Em celulares, o jogo funciona somente na horizontal (modo paisagem). Quando a tela estiver na vertical (modo retrato), exibimos um overlay totalmente preto, sobre toda a tela, com o título "Vire o celular" e a descrição "Para jogar, coloque o celular na horizontal.". O overlay não possui botão e desaparece sozinho assim que a tela voltar para a horizontal.

## Estados da Tela

Quando o jogador não consegue ver o jogo, exibimos uma tela cheia com fundo preto, um título centralizado, uma descrição logo abaixo e, quando necessário, um botão. Todos os estados abaixo seguem esse mesmo modelo.

| Estado | Título | Descrição | Botão |
| --- | --- | --- | --- |
| Carregando | Carregando | Estamos preparando o seu treinador. Isso pode levar alguns instantes. | Nenhum, com barra de carregamento |
| Tentando reconectar | Tentando reconectar | Você perdeu a conexão com o servidor. Estamos tentando reconectar automaticamente. | Nenhum |
| Conexão perdida | Conexão perdida | Você perdeu a conexão com o servidor. Clique no botão abaixo para tentar se reconectar. | Reconectar |
| Sessão expirada | Sessão expirada | Sua sessão expirou. Faça login novamente para continuar jogando. | Fazer login |

> A tela de **carregando** é exibida ao entrar no jogo, até que o estado do treinador seja recebido do serviço e esteja pronto para ser renderizado. Se não for possível carregar, exibimos a tela de conexão perdida.

> Ao perder a conexão, o cliente tenta reconectar sozinho algumas vezes, exibindo a tela de **tentando reconectar**. Se não conseguir, exibimos a tela de **conexão perdida**, e ao clicar em "Reconectar" o cliente volta para a tela de tentando reconectar. Se a conexão for restabelecida em qualquer momento, o jogador volta direto para o jogo, já com o estado atualizado.

> Ao clicar em "Fazer login" na tela de **sessão expirada**, o jogador é redirecionado para a [tela de login](autenticacao.md#tela-de-login).

## Conexão e Atividade Idle

Cada conta só pode estar conectada com um treinador por vez. Se o jogador entrar com um segundo treinador, ou com o mesmo treinador em outra aba ou dispositivo, a conexão anterior é derrubada e exibe a tela de [conexão perdida](#estados-da-tela).

> Fechar a aba ou o navegador não envia nenhum aviso ao serviço, que percebe a queda da conexão por conta própria. Se o treinador estiver em uma atividade que pode continuar sem o jogador, como uma caçada, o serviço verifica se isso é possível e, caso seja, o treinador segue jogando sozinho (idle). Ao reabrir o jogo, o jogador encontra tudo atualizado.

> Ao usar "Trocar treinador" no menu Settings, o cliente avisa o serviço de que está se desconectando. Nesse caso o treinador para qualquer atividade e não continua jogando sozinho.
