# Estrutura do Cliente

Este documento descreve como o código do cliente está organizado: as camadas, onde cada tipo de código mora, a API pública de uma fatia e a regra de dependência.

> O cliente vive em `apps/client`. Ele **não decide nada sobre o jogo**: toda a simulação acontece no servidor, conforme descrito na [Arquitetura](../ARCHITECTURE.md). Aqui só está registrado onde o código do cliente mora e por quê.

## Índice

| Tópico | O que responde |
| --- | --- |
| [As camadas](#as-camadas) | Quais são as camadas e o que cabe em cada uma. |
| [Onde o código mora](#onde-o-código-mora) | A pergunta que decide a camada de um arquivo novo. |
| [A API pública](#a-api-pública) | O que um consumidor pode importar de uma fatia. |
| [A regra de dependência](#a-regra-de-dependência) | Para onde a dependência pode apontar. |
| [Onde mora um pedido ao servidor](#onde-mora-um-pedido-ao-servidor) | A regra que decide se um pedido fica na página, no `shared/` ou na entidade. |
| [O widget do jogo](#o-widget-do-jogo) | Por que existe uma camada `widgets/` em um FSD que a desaconselha. |
| [Como verificar](#como-verificar) | O linter que fiscaliza as regras deste documento. |
| [Documentos relacionados](#documentos-relacionados) | Os outros documentos do cliente. |

## As camadas

O cliente segue o **Feature-Sliced Design** (FSD v2.1). A dependência só aponta para baixo: `app → pages → widgets → features → entities → shared`. Um arquivo nunca importa de uma camada acima, e duas fatias da mesma camada não se importam entre si.

```
apps/client/src/
  app/            ponto de entrada, providers, router e escala da interface
  pages/          uma fatia por rota, cada uma com ui/ e, quando tem estado próprio, model/
  widgets/        blocos compostos de tela: game-hud/
  features/       ações do usuário: authentication/, store/, storage/, backpack/, delete-trainer/
  entities/       modelo de domínio: trainer/ (model/, ui/)
  shared/         ui/ (design system), theme/ (tokens), auth/ (sessão), api/ (cliente HTTP)
```

| Camada | O que vive ali | Quem importa |
| --- | --- | --- |
| `app/` | O ponto de entrada: providers, router, rotas protegidas e a escala da interface. | O `app/` e o `shared/`. |
| `pages/` | A tela: a rota, o layout e a orquestração. | O `app/`, pelo roteador. |
| `widgets/` | Blocos de tela que mais de uma página usa — hoje, só o HUD do jogo. | `pages/`. |
| `features/` | Uma ação do usuário com dono: entrar, criar treinador, abrir a loja. | `pages/` e `widgets/`. |
| `entities/` | O modelo do jogo: o treinador, com tipos, schema, regra e UI. | `features/`, `widgets/` e `pages/`. |
| `shared/` | Infraestrutura sem regra de jogo: o design system, o tema, a sessão e o cliente HTTP. | Todas as camadas. |

Dentro de uma fatia, os arquivos são agrupados por segmento: `ui/` para a tela, `model/` para o estado, a regra e a lógica, `api/` para a conversa com o servidor.

**O nome do arquivo diz o assunto.** Um arquivo se chama pelo domínio que ele serve — `trainer.schema.ts`, `trainer.types.ts`, `useTrainers.ts` — e não pelo papel técnico que ele exerce. `types.ts` e `utils.ts` soltos não respondem "de quem é este arquivo".

## Onde o código mora

A pergunta que decide a camada de um arquivo novo:

> **O componente conhece uma regra do jogo?**

`TrainerCard` conhece o conceito de treinador: ele mostra gênero e nível, e o `TrainerAvatar` desenha o símbolo do gênero. Isso é regra de jogo — é `entities/trainer/`.

`Button` não conhece nada: ele é um botão. Isso é `shared/ui/button/`.

O teste prático: se o componente continuaria existindo se o jogo fosse outro jogo, ele é `shared`. Se ele só faz sentido neste jogo, ele é `entities/` ou `features/`.

**Erro comum:** enfiar tudo em `shared/ui/` e chamar de design system. O design system é a parte **reutilizável**; o resto tem dono, e fingir o contrário só deixa a base grande e sem dono.

**Erro comum:** dar nome de domínio a uma primitiva genérica. `AuthField` era um campo com rótulo e erro usado também pela tela de criar treinador — por isso virou `FormField`, em `shared/ui/form/`.

**A regra de extração.** O código começa na página e só desce de camada quando as três condições valem ao mesmo tempo: o mesmo código é usado em mais de um lugar, agora; ele tem um motivo para mudar que não é o de um consumidor só; e a fronteira tem uma responsabilidade só. Duplicação entre páginas, sozinha, não justifica extrair.

**A entidade é a última a existir.** Ela é a camada mais acessível — todo mundo importa dela —, então a existência da camada não é motivo para criar uma entidade. Uma entidade nasce quando a regra de domínio é reusada de verdade por mais de um consumidor e precisa de uma casa única e estável. Tudo que é só dado de transporte fica no `shared/api/`.

## A API pública

**Toda fatia expõe uma API pública** em um `index.ts`. O consumidor importa de `~/entities/trainer`, nunca de `~/entities/trainer/ui/TrainerCard`. Dentro de uma fatia, o caminho entre segmentos é absoluto (`~/entities/trainer/model/trainer.schema`), para não criar ciclo com o índice público; entre arquivos irmãos do mesmo segmento, o caminho é relativo (`./TrainerCard`).

O `shared/` não tem fatias: ele é organizado por segmento, e cada componente é a sua própria pasta com o seu índice (`~/shared/ui/button`, `~/shared/ui/frame`). O mesmo vale dentro de um segmento — `~/shared/ui/frame` é o caminho, e `~/shared/ui/frame/Slot` não é. O índice do segmento é a API pública dele: `~/shared/theme`, `~/shared/api`, `~/shared/auth`.

**O nome de uma fatia não repete o nome de um segmento do `shared/`.** A fatia `features/authentication/` e o segmento `shared/auth/` são coisas diferentes, e o nome diz qual é: a feature é a ação do usuário, o segmento é a sessão.

## A regra de dependência

```
app  →  pages  →  widgets  →  features  →  entities  →  shared
```

Um `shared/` que importa de `features/` está invertido: não há como testar o design system sem o jogo. Um `theme/` que importa de `ui/` é circular por definição.

Duas fatias da mesma camada não se importam. Quando duas precisam da mesma coisa, a saída é empurrar a parte compartilhada para baixo — uma regra de domínio vai para a entidade, uma ação de usuário vai para a feature — ou compor as duas em uma camada acima, que é a página.

## Onde mora um pedido ao servidor

Duas perguntas, nesta ordem.

**Primeira: o pedido tem um consumidor só ou é compartilhado?** Um consumidor só significa que o pedido fica com ele: o `api/` da página, ou o `api/` da feature que é dona da ação. Sendo compartilhado, vai para a segunda pergunta.

**Segunda: o pedido carrega regra de domínio?** Conhecer a URL de um recurso e o formato da resposta não é regra de domínio. Pedido sem regra é `shared/api/` — acesso puro a recurso é infraestrutura, e mais de um slice chamando não muda isso. Pedido com regra — permissão, transição de estado, cálculo derivado — vai para `entities/<nome>/api/`, uma vez que a fronteira está estável; se a regra só uma tela aplica, a regra fica com a tela.

No cliente, a conversa com o servidor sobre treinador está assim:

| Pedido | Onde mora | Por quê |
| --- | --- | --- |
| Listar, criar, editar e deletar treinador | `shared/api/endpoints/trainer.ts` | Acesso puro a recurso, sem regra de domínio. |
| Listar as criaturas iniciais | `shared/api/endpoints/starter.ts` | Idem. |
| Ler o estado do jogador e abrir a sessão de um treinador | `shared/api/endpoints/player.ts` | Idem. |
| Validar os dados do novo treinador | `entities/trainer/model/trainer.schema.ts` | É a regra do domínio: é o schema que define o que é um treinador válido. |
| A lista de treinadores que a tela usa | `entities/trainer/model/trainersController.ts` + `entities/trainer/model/trainersStore.ts` | É estado do domínio, com mais de um consumidor: o controller tem a regra, a store publica o retrato para as telas. |

O `shared/api/` guarda a base e os endereços (`client.ts`), o transporte (`http.ts`) e os endpoints (`endpoints/`). O `shared/` nunca importa de `entities/`, `features/`, `pages/` ou `widgets/`.

A base da API vem da variável `VITE_API_BASE_URL`. Em desenvolvimento, a ausência da variável aponta para `http://localhost:3001`; em um build, a ausência é um erro — o cliente não sobe apontando para a máquina de quem compilou.

## O widget do jogo

**O `widgets/` é fino e tem um motivo.** A tela do jogo precisa do HUD, e a galeria de design (`/design-system`) mostra os componentes reais da tela do jogo. Sem uma camada entre as duas, a galeria importaria de outra página — o que o FSD proíbe.

A referência oficial do FSD desaconselha a camada `widgets/`: blocos de tela costumam carregar lógica de fluxo, e a fronteira com `features/` fica turva. Desaconselhar não é deprecar — uma camada `widgets/` que já existe continua válida e segue as mesmas regras das outras: API pública, fatias isoladas e nada de regra de jogo.

A camada é mantida porque o HUD é exatamente o caso que a referência descreve como legítimo: **barras de navegação, sidebars, dashboards e rodapés**. A `Toolbar` do jogo é uma barra de navegação, e ela não é uma ação de usuário nem um modelo de domínio.

Ela não cresce: o que for ação de usuário vira `features/`, e o que for modelo vira `entities/`.

## Como verificar

A regra do FSD é verificada pelo linter oficial, o **Steiger**:

```
bunx steiger apps/client/src
```

Ele acusa o que este documento descreve: a dependência apontando para cima, o furto da API pública de uma fatia, o nome de uma fatia repetindo o nome de um segmento do `shared/` e a fatia sem consumidor.

## Documentos relacionados

- [Cliente](CLIENT.md) — o índice da documentação do cliente.
- [Design System](DESIGN_SYSTEM.md) — os tokens, os componentes e as regras de construção da interface.
- [Formulários](FORMS.md) — o estado dos campos, a validação e o envio.
- [Autenticação](AUTH.md) — a sessão, o roteamento protegido e os fluxos.
- [Stack](STACK.md) — as tecnologias escolhidas para o cliente.