# Stack do Cliente

Este documento lista as tecnologias escolhidas para o cliente, o motivo de cada escolha e o que elas obrigam a fazer.

> O cliente vive em `apps/client`. Ele **não decide nada sobre o jogo**: toda a simulação acontece no servidor, conforme descrito na [Arquitetura](../ARCHITECTURE.md). Aqui só está registrado como o cliente representa e comunica esse estado.

## Stack

| Tecnologia | Papel |
| --- | --- |
| Bun | Runtime, gerenciador de pacotes e runner de testes |
| TypeScript | Tipagem do código, no cliente e no servidor |
| Vite | Build e servidor de desenvolvimento |
| React | Renderização da interface e componentes sobrepostos ao canvas |
| React Router | Roteamento entre as telas do cliente |
| Chakra UI | Design system dos elementos de interface |
| PixiJS | Renderização do mundo do jogo no canvas |
| Zustand | Armazenamento do estado do cliente |
| Supabase Auth | Autenticação do usuário |
| WebSocket | Comunicação com o servidor durante o jogo |

## Bun

O Bun é o gerenciador de pacotes e o runner de testes do projeto.

> Não se usa `npm`, `yarn` nem `pnpm`. Um único gerenciador de pacotes em todo o projeto, com um lockfile só.

O mesmo runner de testes cobre o cliente e o servidor, o que faz o teste de uma regra de negócio não exigir configuração separada da aplicação onde ela vive.

## TypeScript

Todo o código é TypeScript, no cliente e no servidor.

> Escolha feita uma única vez para o projeto inteiro. Não há JavaScript sem tipagem, nem em configuração de build.

A tipagem também serve de documentação nos pontos onde o cliente e o servidor trocam mensagens: os tipos do protocolo descrevem o que cada lado espera.

## Vite

O build e o servidor de desenvolvimento do cliente são feitos pelo Vite.

> Escolhido por ser enxuto e por não exigir configuração para começar. O bundle sai rápido e o servidor de desenvolvimento sobe na hora.

O Vite serve o cliente em `http://localhost:5173` durante o desenvolvimento.

## React

A interface é construída em React.

> Escolhido pela equipe e pelo ecossistema: Chakra, as ferramentas de teste e o conhecimento de quem vai manter o código.

O React cuida dos elementos de interface, e não do mundo do jogo, que é desenhado pelo PixiJS.

## React Router

O roteamento entre as telas é feito pelo React Router.

> Escolhido porque o controle de acesso descrito em [Autenticação](../../game/AUTHENTICATION.md) é o problema central do roteamento aqui: das nove rotas, seis são públicas e três exigem sessão. Isso é uma rota intermediária que verifica a sessão e redireciona, e é exatamente o que o React Router resolve de forma direta.

O TanStack Router foi considerado e descartado. Os diferenciais dele são search params tipado e code splitting automático por rota, e nenhum dos dois se aplica: o estado do jogo chega pelo WebSocket e não por busca de dados na rota.

> O code splitting também existe no React Router, com carregamento preguiçoso por rota. O que não se quer é o roteamento por arquivo, que dita a estrutura de pastas do cliente a partir da biblioteca, e para um número estável de telas isso é mais peso do que resolve.

## Chakra UI

O Chakra é o design system dos elementos de interface, usado exatamente como foi feito, sem customização de componentes.

> Para as fases alfa e beta a diretriz é customizar o mínimo possível. A interface ainda vai mudar muito, e customizar componente agora é trabalho que provavelmente será jogado fora.

A saída para customizar algo no Chakra é criar um **token semântico** no sistema de temas, e não alterar o estilo do componente. Assim a customização fica em um único lugar e é fácil de reverter.

O design system em si, com as escalas, os tokens semânticos, as receitas, o catálogo de componentes e as regras de uso, está em [Design System](DESIGN_SYSTEM.md). Ele é a fonte da verdade da interface: toda tela do cliente sai dos componentes de `apps/client/src/components/`, e nenhum componente do Chakra é reescrito.

O tema tem uma divisão em quatro camadas: `theme/tokens` traz os valores brutos, `theme/semanticTokens` diz para que cada um serve, `theme/textStyles` traz os estilos de texto prontos, e `theme/recipes` traz as receitas — o estilo que **cruza** camadas, como a anatomia da camada e o anel de seleção. Nenhum componente do Chakra é reescrito, e a identidade visual vem inteira dessas camadas.

Quando o Chakra já resolve um comportamento — *focus trap*, `aria-modal`, posicionamento, região `aria-live`, navegação por setas — o design system usa o Chakra. O que é nosso é a aparência.

**Os tipos do tema são gerados.** O `@chakra-ui/cli` gera os tipos dos tokens, das receitas e das paletas a partir do tema, e o resultado é escrito no pacote do Chakra instalado. O comando roda no `postinstall` e antes do `build`, para que os tipos nunca fiquem velhos.

**O guarda dos tokens roda no typecheck.** O Chakra aceita qualquer string em uma prop de cor: `bg="coin"` compila, passa no typecheck e vira `background: coin` — CSS inválido, que o navegador descarta em silêncio. `scripts/check-tokens.ts` resolve cada valor de cor pelo mesmo dicionário de tokens que a interface usa e falha o build quando o token não existe, quando a cor é crua, ou quando um componente de `base/` consome um passo cru de escala em vez de um token semântico.

A fonte é servida pelo Google Fonts, com quatro famílias: Cinzel para o nome do jogo e os nomes de criatura, Barlow Semi Condensed para os rótulos de interface, Barlow para o texto corrido, e JetBrains Mono para números. A escolha de uma fonte por categoria vem da necessidade de caixa alta com entreletra aberta nos rótulos, de um serifa gravado nos títulos e de números tabulares nos valores.

> O Dota 2 usa Reaver na interface e Radiance nos títulos. As duas não estão no Google Fonts, e o Cinzel é a aproximação mais próxima da Radiance dentro do que está disponível.

## PixiJS

O mundo do jogo é renderizado com o PixiJS, em um canvas separado dos elementos de interface.

> Escolhido por ser um renderizador 2D leve, feito para WebGL, que lida bem com cenas grandes e muitos sprites — que é exatamente o caso de um jogo top-down com várias criaturas visíveis.

O estilo do jogo impõe um conjunto de configurações que não são o padrão da biblioteca:

- `resolution` em 1, porque o jogo roda também em celular e resolução maior dobra o trabalho de renderização.
- `antialias` desligado, `roundPixels` ligado e `scaleMode` em nearest nos sprites, porque o jogo é em pixel art e escala fracionária deixa a imagem borrada.
- Escala sempre inteira, calculada a partir do espaço disponível e do tamanho do tile.

> Essas configurações são consequência do estilo de arte, não preferência. Se o jogo deixar de ser pixel art, as três últimas saem e a primeira volta a ser avaliada.

O canvas é dimensionado pelo elemento que o contém, e não pela janela do browser, porque a tela do jogo ocupa apenas a altura restante abaixo da toolbar.

## Zustand

O estado do cliente é guardado em stores Zustand.

> Escolhido porque o estado do jogo muda com frequência, com o servidor empurrando atualizações enquanto a partida acontece. Se esse estado passasse por `useState`, cada atualização viraria um novo render do React e a tela não acompanharia o ritmo do servidor.

**O estado do jogo não é estado do React.** O canvas lê o store diretamente a cada quadro, sem passar por render de componente. A interface em React também pode ler, mas só o que ela precisa exibir.

> Essa é a razão de existir o Zustand aqui e a regra que decorre dela. O React serve para a interface, e o estado que muda rápido é lido fora dele.

O estado da conta e da sessão fica em um store separado do estado do jogo.

> Separar os dois evita que a troca de tela recrie o estado do treinador, que foi carregado uma vez ao entrar no jogo.

## Supabase Auth

A autenticação é feita pelo Supabase Auth, usado diretamente no cliente. Ele responde por login, cadastro, login via Google, recuperação de senha e pelo controle da sessão.

> Escolhido porque entrega quase tudo o que o [fluxo de autenticação do jogo](../../game/AUTHENTICATION.md) descreve, o que evita manter login, sessão, OAuth e recuperação de senha por conta própria.

O cliente **não valida token algum**: apenas repassa o access token ao servidor, que faz a validação. O servidor trabalha com o **token do próprio Supabase**, e não com um token próprio emitido por ele.

> Usar o SDK do Supabase para falar com o próprio servidor não funciona, e essa confusão é fácil de ter. O `@supabase/supabase-js` conversa com os serviços do Supabase — banco, autenticação, storage, realtime — e não autentica requisições em uma aplicação própria. São duas coisas separadas: o cliente fala com o Supabase Auth, e o servidor valida o token que o cliente recebeu.

Duas partes do fluxo de autenticação não vêm prontas do Supabase e são implementadas por conta própria: o merge da conta Google com uma conta já existente e o controle de tentativas de login.

> Essas regras ficam em um módulo de autenticação do cliente, e não em chamadas ao SDK espalhadas pelo código, para que o fluxo descrito em [Autenticação](../../game/AUTHENTICATION.md) possa ser implementado e testado em um lugar só.

## WebSocket

O cliente se comunica com o servidor por **WebSocket**, usando a API nativa do browser, sem biblioteca intermediária.

O canal é aberto uma vez, quando o jogador entra no jogo, e fica aberto até a saída. O servidor empurra as atualizações de estado e o cliente responde apenas com comandos. O cliente nunca pergunta o estado num intervalo de tempo.

> A WebSocket foi escolhida porque o servidor precisa iniciar a comunicação: ele avisa que uma criatura desmaiou, que um cooldown terminou ou que um treino terminou, e nada disso acontece em resposta a uma pergunta do cliente.

> O Supabase Realtime foi considerado e descartado como canal do jogo. Ele adiciona um intermediário entre o cliente e o servidor, e a autorização por topic não substitui a validação que o servidor já faz do jogador. O porquê da escolha está em [Stack do Servidor](../server/STACK.md).

O token é enviado uma vez, na abertura do canal, e não a cada mensagem.

> O access token do Supabase tem validade curta, muito menor que a sessão do usuário descrita em [Autenticação](../../game/AUTHENTICATION.md). Como o canal fica aberto durante a partida inteira, o cliente acompanha a validade do token e renova a sessão antes de ele expirar, reenviando o token novo pelo mesmo canal.

> O cliente acompanha a validade do token porque é ele quem o recebe do Supabase Auth. O que o servidor faz com esse token está em [Stack do Servidor](../server/STACK.md).

## Testes

O cliente usa o runner de testes do Bun, o mesmo do servidor.

> A lógica que decide o que desenhar precisa ficar separada da renderização para poder ser testada, porque o ambiente de teste não tem WebGL e não exercita o canvas.

## Pendências

Os pontos abaixo dizem respeito à stack e ainda estão em aberto:

- O `@supabase/supabase-js`, o React Router e o Zustand estão escolhidos mas ainda não instalados.

O formato dos assets, o tamanho do tile e o tamanho da janela de visão não são pendências de stack: são decisões de design do jogo, e pertencem a [Game Design](../../game/GAME.md).
