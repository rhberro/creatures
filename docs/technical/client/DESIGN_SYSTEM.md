# Design System

Este documento é a fonte da verdade da interface do cliente. Ele descreve a direção visual, a arquitetura em camadas, os tokens, o catálogo de componentes reutilizáveis e as regras para montar uma tela nova.

> O código vive em `apps/client/src/theme/` e `apps/client/src/components/`. Este documento explica **como usar**; o código é a referência dos valores exatos.

---

## 1. Em uma frase

Interface de jogo escura, densa e geométrica, com tipografia de título gravada, cor violeta para o destaque e âmbar só para moeda. O chrome ao redor do jogo é o do Dota 2; o pixel art fica no canvas do PixiJS.

---

## 2. Direção visual

| Elemento | Decisão |
| --- | --- |
| Tema | Escuro único. Sem tema claro. |
| Fundo | Azul-cinza dessaturado, chapado. Nunca preto puro, nunca gradiente. |
| Destaque | Violeta arcano (`arcane`). Seleção, aba ativa, ação principal. |
| Secundário | Ciano frio (`frost`). Estado disponível, moeda premium. |
| Moeda | Âmbar mineral (`gold`), dessaturado. Só para o gold coin. |
| Perigo | Vermelho seco (`blood`). Dano, vida, destrutivo. |
| Elementos | Laranja (`ember`) para fogo, verde-oliva (`verdant`) para planta. |
| Título | Cinzel — serifa chanfrado, de título gravado. |
| Rótulo | Barlow Semi Condensed, caixa alta, entreletra aberta. |
| Texto | Barlow, caixa normal. |
| Números | JetBrains Mono, tabulares. |
| Superfície | Sombra em camadas, não traço. |
| Raio | Quase reto: 1px a 12px. |
| Densidade | Alta. Information dense, não espaçosa. |

### Por que violeta, e não dourado

O âmbar e o verde saturados da paleta do Dota 2 funcionam dentro do jogo, mas numa interface administrativa escura eles leem como brinquedo. O violeta tem a mesma função de destaque com saturação bem menor. O âmbar continua existindo, mas só como moeda — onde ele é informação, não destaque.

---

## 3. Arquitetura

### 3.1 As quatro camadas

O cliente tem quatro camadas, e a dependência só aponta para baixo. Nunca para cima, nunca para o lado.

```
apps/client/src/
  theme/                 a linguagem do design — não sabe o que é um componente
  components/base/       primitivas — não sabem regra de jogo
  components/domain/     componentes que conhecem o jogo
  pages/                 rotas — juntam base e domínio
```

| Camada | O que é | Regra |
| --- | --- | --- |
| `theme/` | Tokens, estilos de texto, e as receitas que **cruzam** camadas (o anel de seleção). | Não importa nada de `components/`. |
| `components/base/` | O vocabulário visual. Botão, texto, campo, moldura, slot, modal, ícone, aba, chip, popup, alerta. | Não sabe o que é trainer, criatura ou caçada. Só importa de `theme/`. |
| `components/domain/` | Componentes que carregam regra de jogo: `auth/`, `trainer/`, `brand/`. | Importa de `base/` e de `theme/`. Nunca é importado por `base/`. |
| `pages/` | Rotas. | Compõe `base/` e `domain/`. |

### 3.2 Base ou domínio?

A pergunta que decide onde o componente mora:

> **O componente conhece uma regra do jogo?**

`TrainerCard` conhece o conceito de treinador: ele mostra gênero e nível, e o `TrainerAvatar` desenha o símbolo do gênero. Isso é regra de jogo — é `domain/trainer/`.

`Button` não conhece nada: ele é um botão. Isso é `base/button/`.

O teste practical: se o componente continuaria existindo se o jogo fosse outro jogo, ele é base. Se ele só faz sentido neste jogo, é domínio.

**Erro comum:** enfiar tudo em `base/` e chamar de design system. O design system é a parte **reutilizável**; o resto é domínio, e fingir o contrário só deixa a base grande e sem dono.

### 3.3 Regra de dependência

```
pages  →  domain  →  base  →  theme
```

Um `base/` que importa de `domain/` está invertido: não há como testar a base sem o jogo. Um `theme/` que importa de `components/` é circular por definição.

---

## 4. Tokens

Três camadas. A interface consome a última.

### 4.1 Base — `theme/tokens.ts`

Valores brutos, sem significado de uso. Sete escalas de cor (`base`, `arcane`, `frost`, `gold`, `blood`, `ember`, `verdant`), mais fontes, raios e sombras.

### 4.2 Semântico — `theme/semanticTokens.ts`

Diz para que cada cor serve. É a camada que a interface consome.

| Namespace | Uso |
| --- | --- |
| `bg` | `bg` (canvas), `bg.panel`, `bg.raised`, `bg.sunken`, `bg.overlay`, `bg.selected`, `bg.error` |
| `fg` | `fg`, `fg.muted`, `fg.subtle`, `fg.error` |
| `border` | `border`, `border.emphasized`, `border.selected`, `border.error` |
| `currency` | `currency.gold`, `currency.diamond` |
| `hp` / `stamina` | A vida da criatura e a stamina do treinador |
| `state` | `state.selected`, `state.disabled` |
| `element` | `element.fire`, `element.plant`, `element.neutral` |

**Um namespace com chave `DEFAULT` se acessa pelo nome, sem sufixo.** `currency.gold` resolve `currency.gold.DEFAULT`; `currency.gold.DEFAULT` não existe.

**As paletas do Chakra apontam para as escalas do jogo.** `colorPalette="arcane"` é a paleta `arcane`; `colorPalette="red"` é a mesma de `blood`. O nome nativo nunca produz uma cor fora do sistema.

**Os raios de camada** (`radii.l1`, `radii.l2`, `radii.l3`) decidem o quanto fica reto o botão, o campo e o menu. É o token `radii.l2` que resolve o raio do botão.

### 4.3 Estilo de texto — `theme/textStyles.ts`

| Variante | Uso |
| --- | --- |
| `display` | A wordmark |
| `title` | Título de tela e de modal |
| `name` | Nome de criatura, de item e de trainer |
| `section` | Cabeçalho de seção |
| `label` | Rótulo de botão, de aba e de item de menu |
| `meta` | Texto secundário: nível, categoria, status |
| `body` / `bodyLarge` | Texto corrido |
| `numeric` | Valor, preço, contador, tempo |

**O `textStyle` ganha do `fontSize`.** Quem aplica um estilo de texto não consegue diminuir o tamanho com `fontSize` por prop — o estilo vence, e a prop vira código morto. Por isso o tamanho mora **dentro** do estilo, e não na prop.

### 4.4 Receitas — `theme/selection.ts`

Valores de estilo que **cruzam camadas** e por isso não pertencem a nenhum componente: o anel de seleção de 3px, usado pelo `Slot` (base), pelo `TrainerCard` (domínio) e pelos cards da galeria.

```ts
import { SELECTED_RING } from '~/theme/selection';

<Box _before={selected ? SELECTED_RING : undefined} />
```

Se um valor é usado por `base/` e por `domain/`, ele é da linguagem do design e vai para `theme/`. Se é usado só por um componente, ele é dele e fica no arquivo dele.

---

## 5. As regras de construção

Estas cinco regras definem a forma do código. Elas valem para `base/`, para `domain/` e para a galeria.

### R1 — Um componente por arquivo, e uma pasta por componente

Cada componente vive na sua própria pasta, em um arquivo com o mesmo nome. Uma pasta pode ter vários arquivos quando eles compõem o mesmo componente — um `Modal` que precisa de cabeçalho e rodapé vira `modal/Modal.tsx`, `modal/ModalHeader.tsx`, `modal/ModalBody.tsx` e `modal/ModalFooter.tsx`.

Dois componentes no mesmo arquivo é anti-pattern forte: mistura duas responsabilidades, o arquivo vira o lugar onde se procura "qualquer coisa que renderiza", e o nome do arquivo deixa de dizer o que ele é. Funções auxiliares e constantes **podem** ficar no mesmo arquivo, desde que não sejam exportadas como componente.

### R2 — Nomenclatura dos arquivos irmãos

Dentro da pasta de um componente, os arquivos auxiliares têm o prefixo do componente que os serve, em camelCase:

| Arquivo | Conteúdo |
| --- | --- |
| `X.tsx` | O componente `X`. |
| `x.types.ts` | Os tipos e as props de `X`. |
| `x.constants.ts` | As constantes de `X`. |
| `useX.ts` | O hook com a lógica de `X`. |
| `x.context.ts` | O React context de `X`. |

Exemplos reais:

```
base/frame/Frame.tsx          base/frame/frame.types.ts      base/frame/frame.constants.ts
base/frame/Slot.tsx           base/frame/slot.types.ts
base/modal/Modal.tsx          base/modal/modal.types.ts
base/alert/useAlerts.ts       base/alert/alert.types.ts       base/alert/alert.context.ts
domain/trainer/StarterGrid.tsx  domain/trainer/trainer.types.ts
```

**O prefixo responde "de quem é este arquivo".** `types.ts` solto não responde; `trainer.types.ts` responde.

**E a `theme/`?** Para o que cruza camadas. `SELECTED_RING` é usado pelo `Slot` (base) e pelo `TrainerCard` (domínio), então mora em `theme/selection.ts` — não em `base/frame/ring.ts`, que fingia ser do frame e na verdade era de todo mundo.

### R3 — Composição, não configuração

**Props descrevem dados, nunca estrutura.** A estrutura vem de `children` e de partes componentes.

O anti-pattern é a prop que desenha: `title`, `subtitle`, `showIcon`, `iconPosition`, `footerText`. Cada uma delas é uma decisão de layout congelada dentro de uma prop, e cada variação nova vira mais uma prop.

O caminho certo é trocar a prop pela parte:

```tsx
// ❌ configuração: o Frame decide como o cabeçalho é
<Frame title="Loja" footer={<Button tone="primary">Comprar</Button>} />

// ✅ composição: quem monta decide a estrutura
<Frame>
  <FrameHeader>Loja</FrameHeader>
  <Box padding="4">{itens}</Box>
  <FrameFooter>
    <Button tone="primary">Comprar</Button>
  </FrameFooter>
</Frame>
```

**Como saber quando trocar uma prop por uma parte:** quando a prop tem mais de um valor possível que muda o *layout* (e não o *dado*), ela vira parte. `tone` muda a cor — continua prop. `title` muda a estrutura — vira `FrameHeader`.

**Texto entra como `children`, não como `label`.** `<Tab label="Comprar" />` vira `<Tab>Comprar</Tab>`. O `label` é um texto que a interface sempre desenhou do mesmo jeito; `children` deixa o chamador desenhar do jeito que precisar.

### R4 — A lógica fora da view

Um componente que tem estado e comportamento vira **dois arquivos**: um hook com a lógica, e o componente com a view.

```ts
// base/overlay/useOverlay.ts — a lógica, sem DOM
export function useOverlay(props: OverlayDismissProps): void
```

```tsx
// base/overlay/Overlay.tsx — a view
export function Overlay(props: OverlayProps): ReactElement
```

O hook é testável sem renderizar nada, e a mesma lógica serve a visuais diferentes. É o que permite ter um `Modal` e um `Drawer` com o mesmo comportamento de ESC e de clique fora, sem copiar código.

**Quando a lógica precisa ser compartilhada com as partes do componente**, ela vai para um context, e o hook vira `useXContext`:

```ts
// base/overlay/overlay.context.ts
export const OverlayContext = createContext<OverlayContextValue | null>(null);

// base/overlay/useOverlayContext.ts
export function useOverlayContext(): OverlayContextValue
```

Assim o `ModalHeader` sabe fechar o modal sem receber `onClose` por prop em cada nível.

### R5 — Base não conhece o domínio

`components/base/` não importa nada de `components/domain/`. Se precisa, é sinal de que o componente não é base.

O que o base **pode** fazer é expor os ganchos: o `Slot` sabe o que é selecionado e equipado, mas não sabe o que é uma habilidade. Quem sabe é o domínio.

---

## 6. Catálogo de componentes

### 6.1 Base — ação e texto

| Componente | Import | Quando usar |
| --- | --- | --- |
| `Button` | `~/components/base/button/Button` | Qualquer ação. `tone`: `primary` (a ação da tela), `secondary` (alternativa), `ghost` (terceira opção), `danger` (destrutivo). `palette` escolhe a paleta do jogo quando `tone` não basta. Nunca `colorPalette` direto. |
| `Text` | `~/components/base/text/Text` | Qualquer texto. `variant` vem da tabela 4.3. Nunca `fontSize` ad hoc. |
| `TextField` | `~/components/base/field/TextField` | Campo de texto e de senha. Já vem em 16px. `clearable` mostra o **X** dentro do campo, à direita, que limpa o valor. |
| `IconButton` | `~/components/base/button/IconButton` | Botão só de ícone. `tone`: `neutral`, `primary`, `secondary`, `danger`. Sempre 44px de alvo. |
| `IconBadge` | `~/components/base/badge/IconBadge` | O quadrado arredondado que segura um ícone dentro de um alerta ou de um item. |
| `Pressable` | `~/components/base/interactive/Pressable` | Torna qualquer coisa clicável **e** acessível: `role="button"`, `tabIndex`, Enter e Espaço, anel de foco visível e hover. Todo card que se clica usa este, e não um `onClick` solto. |
| `Link` | `~/components/base/link/Link` | Link de navegação. Sem `tone`, é link de texto: cor primária, sublinhado, hover mais claro. Com `tone`, é um link **com cara de botão** — o mesmo `as="button"` do shadcn, e o sublinhado some. Aceita `width`, para o botão de link ocupar a largura do card. Nenhum link de texto usa o `Link` cru do router. |
| `Icon` | `~/components/base/icon/Icon` | A primitiva do svg: `size`, traço de 2px, grade de 24. Todo ícone é composed dela. |
| Ícones | `~/components/base/icon` | `IconBag`, `IconBell`, `IconBolt`, `IconChest`, `IconClose`, `IconCoin`, `IconCrosshair`, `IconGem`, `IconGear`, `IconHeart`, `IconMap`, `IconPlay`, `IconPotion`, `IconPrism`, `IconSearch`, `IconStore`, `IconTeam`, `IconUsers`. |

**Um ícone novo é só o caminho:**

```tsx
// base/icon/IconSpark.tsx
import type { ReactElement } from 'react';

import { Icon } from './Icon';
import type { IconProps } from './icon.types';

export function IconSpark(props: IconProps): ReactElement {
  return (
    <Icon {...props}>
      <path d="M12 3v18M3 12h18" />
    </Icon>
  );
}
```

Nenhum svg inteiro, nenhum `DEFAULT_SIZE` repetido, nenhum `strokeWidth` reescrito. O tamanho e o traço são da primitiva.

### 6.2 Base — superfície

| Componente | Import | Quando usar |
| --- | --- | --- |
| `Frame` | `~/components/base/frame/Frame` | O painel. `tone`: `panel` (padrão), `recessed` (rebaixo), `overlay` (modal), `transparent`. `accent` a linha violeta no topo. O cabeçalho e o rodapé são **partes**, não props. |
| `FrameHeader` | `~/components/base/frame/FrameHeader` | O cabeçalho com divisória. Recebe `children`. |
| `FrameFooter` | `~/components/base/frame/FrameFooter` | O rodapé com divisória. Recebe `children`. |
| `FrameAccent` | `~/components/base/frame/FrameAccent` | A linha violeta no topo do painel. |
| `Slot` | `~/components/base/frame/Slot` | O slot de item, de criatura e de habilidade. `selected` (anel violeta + marcador de canto), `equipped` (cunha no canto), `empty`. |
| `CornerBracket` | `~/components/base/frame/CornerBracket` | O marcador de canto do slot selecionado. |
| `EquippedWedge` | `~/components/base/frame/EquippedWedge` | A cunha de equipado. |
| `Cooldown` | `~/components/base/frame/Cooldown` | A sombra de cooldown que desce sobre o slot. |
| `CloseControl` | `~/components/base/frame/CloseControl` | O botão de fechar de uma camada. |
| `SELECTED_RING` | `~/theme/selection` | A borda de seleção, 2px em `arcane.400`, desenhada por um pseudo-elemento por cima do elemento. Use quando precisar marcar a seleção em um elemento que não é `Slot`. |

### 6.3 Base — dialog e modal

São **dois componentes diferentes**, com pesos diferentes.

| | `Dialog` | `Modal` |
| --- | --- | --- |
| Para quê | Confirmação, aviso, decisão de duas opções | Tela com conteúdo interno: loja, área de caça, mochila |
| Título | À esquerda, `variant="section"` | Centralizado, `variant="title"` |
| Fechar | Pelos botões ou pelo ESC. **Sem** botão no canto | Pelo ESC, pelo botão no canto ou pelo fundo |
| Largura | ~420px, aperta no conteúdo | Declarada, com o corpo rolando |
| Fundo | Fecha no clique fora | Não fecha no clique fora |

| Componente | Import |
| --- | --- |
| `Dialog` / `DialogHeader` / `DialogBody` / `DialogFooter` | `~/components/base/dialog/*` |
| `Modal` / `ModalHeader` / `ModalBody` / `ModalFooter` | `~/components/base/modal/*` |
| `Drawer` / `DrawerHeader` / `DrawerBody` / `DrawerFooter` | `~/components/base/drawer/*` |
| `Overlay` / `useOverlay` / `useOverlayContext` | `~/components/base/overlay/*` |

**Camada contida não é camada.** Um overlay `contained` — o que a galeria usa para mostrar um modal dentro da página — **não escuta ESC nem clique fora**. Um listener global de `mousedown` que chame `preventDefault()` rouba o foco de todo input da página; por isso o overlay só fica ativo quando ele é uma camada de verdade.

**A anatomia é a mesma, o peso não.** Todo dialog e todo modal têm cabeçalho, corpo e rodapé; o que muda é o tamanho e o que cabe dentro.

**Um diálogo é um `Dialog`, nunca um `Modal` encolhido.** E nunca dois: um diálogo que existe no app existe na galeria **como o mesmo componente**, com o mesmo texto.

### 6.4 Base — sobreposição

`Modal` e `Drawer` são **compostos**: a raiz entrega a estrutura e o contexto, e as partes desenham.

| Componente | Import | Quando usar |
| --- | --- | --- |
| `Modal` | `~/components/base/modal/Modal` | Modal composto. Fecha por ESC ou pelo botão; clicar fora **não** fecha. |
| `ModalHeader` | `~/components/base/modal/ModalHeader` | Cabeçalho do modal, com o botão de fechar. Recebe `children`. |
| `ModalBody` | `~/components/base/modal/ModalBody` | O corpo do modal. Recebe `children`. |
| `ModalFooter` | `~/components/base/modal/ModalFooter` | O rodapé do modal. Recebe `children`. |
| `Drawer` | `~/components/base/drawer/Drawer` | Drawer lateral. Fecha por ESC e pelo clique no fundo. |
| `DrawerHeader` / `DrawerBody` / `DrawerFooter` | `~/components/base/drawer/*` | As partes do drawer. |
| `Overlay` | `~/components/base/overlay/Overlay` | O fundo escurecido. |
| `useOverlay` | `~/components/base/overlay/useOverlay` | A lógica de ESC e de clique fora. Headless. |
| `useOverlayContext` | `~/components/base/overlay/useOverlayContext` | O `onClose` compartilhado com as partes. |

```tsx
<Modal onClose={onClose}>
  <ModalHeader>Mochila</ModalHeader>
  <ModalBody>
    <SlotGrid />
  </ModalBody>
  <ModalFooter>
    <Button tone="primary">Fechar</Button>
  </ModalFooter>
</Modal>
```

O `ModalHeader` não recebe `onClose`: ele lê do contexto do overlay. Isso é R4 aplicado — a lógica fica em um lugar e as partes se conectam a ela.

### 6.5 Base — navegação, filtro e aviso

| Componente | Import | Quando usar |
| --- | --- | --- |
| `TabBar` / `Tab` | `~/components/base/tab/TabBar`, `~/components/base/tab/Tab` | Navegação dentro de um modal. Sublinhado violeta na aba ativa. O `Tab` recebe `children`. |
| `Chip` | `~/components/base/chip/Chip` | Filtro inclinado. Não é aba. `tone`: `arcane`, `blood`, `ember`, `frost`, `gold`, `neutral`, `verdant` — uma variante por elemento, para o elemento da criatura aparecer igual em filtro, em card e em lista. |
| `Popup` | `~/components/base/popup/Popup` | O comportamento de hover e clique que fixa o popup. |
| `PopupCard` | `~/components/base/popup/PopupCard` | A superfície do popup. |
| `ScrollArea` | `~/components/base/scroll/ScrollArea` | Área rolável, com barra sempre visível. |
| `AlertsProvider` / `useAlerts` / `Alert` / `AlertClose` / `AlertProgress` / `AlertsViewport` | `~/components/base/alert/*` | O aviso do canto superior direito, com barra de tempo. Ele **entra** deslizando e sai com fade; quem fecha, seja o tempo ou o botão, sempre sai animado. |

### 6.6 Domínio

| Componente | Import | Quando usar |
| --- | --- | --- |
| `AuthPage` | `~/components/domain/auth/AuthPage` | Página de autenticação completa, com a wordmark. |
| `AuthShell` | `~/components/domain/auth/AuthShell` | O shell do formulário. |
| `AuthField` | `~/components/domain/auth/AuthField` | Campo com rótulo, valor e erro. |
| `AuthActions` | `~/components/domain/auth/AuthActions` | A coluna de ações do formulário. |
| `AuthDivider` | `~/components/domain/auth/AuthDivider` | O separador "ou". |
| `AuthForm` | `~/components/domain/auth/AuthForm` | O `<form>` com o campo de usuário oculto. |
| `Wordmark` | `~/components/domain/brand/Wordmark` | A marca `CREATURES` com a régua dourada. |
| `TrainerList` / `TrainerCard` / `CreateTrainerCard` | `~/components/domain/trainer/*` | A lista de treinadores e o card de criar. |
| `TrainerAvatar` / `GenderToggle` / `StarterGrid` | `~/components/domain/trainer/*` | A criação de trainer. |
| `TrainerDeleteDialog` | `~/components/domain/trainer/TrainerDeleteDialog` | O diálogo de exclusão. É o **mesmo** no app e na galeria. |
| `TrainersPanel` | `~/components/domain/trainer/TrainersPanel` | O painel da lista de treinadores: moldura, cabeçalho, lista, card de criar e as ações. É o **mesmo** no app e na galeria. |
| `CreateTrainerPanel` | `~/components/domain/trainer/CreateTrainerPanel` | A moldura da criação de trainer. O formulário entra como `children`. |
| `BrandLayout` | `~/components/domain/brand/BrandLayout` | A wordmark + o conteúdo, centrado na tela. |
| `StoreModal` | `~/components/domain/game/StoreModal` | A loja: abas Comprar/Vender, grade de slots e rodapé com quantidade e total. |
| `StorageModal` | `~/components/domain/game/StorageModal` | O armazenamento: seção Time e seção Criaturas, com a busca no rodapé. |
| `StarterCard` | `~/components/domain/trainer/StarterCard` | O card de criatura inicial, focusável pelo teclado. |
| `FieldError` | `~/components/domain/auth/FieldError` | A mensagem de erro de um campo. |
| `LegalNotice` | `~/components/domain/auth/LegalNotice` | O aviso de termos e privacidade, variando a ação que o precede. |
| `Toolbar` / `ToolbarLeft` / `ToolbarRight` / `ToolbarIdentity` / `CurrencyBadge` | `~/components/domain/game/*` | A barra superior do jogo. É a **mesma** no app e na galeria — nunca duas cópias. |
| `TeamStrip` / `CreatureTab` / `CreaturePortrait` / `EmptyCreatureTab` | `~/components/domain/game/*` | As linguetas do time, logo abaixo da toolbar. Slot preenchido é maior e mostra retrato, nível e nome; slot vazio é menor e não mostra nada. |
| `PlayButton` | `~/components/domain/game/PlayButton` | O botão de play: uma barra horizontal encostada na borda esquerda, acima da barra de habilidades, com o chevron e o rótulo. |
| `ShopButton` | `~/components/domain/game/ShopButton` | O botão da loja: um botão de texto flutuante logo acima da barra de habilidades. Flutua — nunca empurra o canvas. |
| `SkillBar` | `~/components/domain/game/SkillBar` | A barra de habilidades. É a **mesma** no app e na galeria. |

---

## 7. Como montar uma tela

### 7.1 A regra de ouro

**Toda a interface sai dos componentes acima.** Se uma tela precisa de um elemento que não existe, ele é um componente novo — no `base/` se serve a qualquer tela, no `domain/` se carrega regra de jogo. Nunca um `Box` com estilo solto.

Duas implementações — uma para a galeria e outra para o app — é o que faz as duas divergirem. A galeria mostra o componente real.

### 7.2 Antes de escrever: component ou layout?

```
Precisa de cor, borda, sombra ou raio?
  ├─ não → Box. Box serve para ARRUMAR, nunca para DECORAR.
  └─ sim → É um componente.
              ├─ serve a qualquer tela?        → components/base/
              └─ conhece regra do jogo?        → components/domain/
```

### 7.3 Ordem de montagem

1. **Escolha a moldura.** `Frame` para painel, `Modal` para modal, `Drawer` para lateral, `AuthPage` para autenticação.
2. **Monte as partes da moldura** (`FrameHeader`, `FrameFooter`, `ModalBody`…) como `children`.
3. **Monte a hierarquia** com `Box` de layout: `display`, `gap`, `padding`, `alignItems`.
4. **Encha com conteúdo** usando `Text`, `Button`, `TextField`, `Slot`, `Tab`, `Chip`.
5. **Declare os estados** da superfície: carregando, vazio, erro, populado e limite.

### 7.4 Exemplo

```tsx
import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Button } from '~/components/base/button/Button';
import { Frame } from '~/components/base/frame/Frame';
import { FrameFooter } from '~/components/base/frame/FrameFooter';
import { FrameHeader } from '~/components/base/frame/FrameHeader';
import { Text } from '~/components/base/text/Text';

export function CityPanel(): ReactElement {
  return (
    <Frame>
      <FrameHeader>Cidade</FrameHeader>
      <Box display="flex" flexDirection="column" gap="3" padding="4">
        <Text variant="body">Você está na cidade. A caçada continua quando fechar.</Text>
      </Box>
      <FrameFooter>
        <Button tone="primary">Entrar</Button>
      </FrameFooter>
    </Frame>
  );
}
```

### 7.5 Checklist antes de dar por pronto

- [ ] Nenhum `colorPalette` fora das paletas do jogo.
- [ ] Nenhum `fontSize` ou `fontWeight` fora de um `variant` de texto.
- [ ] Nenhum `Box` com cor, borda, sombra ou raio: isso é componente.
- [ ] Um componente por arquivo, e uma pasta por componente.
- [ ] Os arquivos irmãos seguem o prefixo do componente (`x.types.ts`, `x.constants.ts`, `useX.ts`).
- [ ] `base/` não importa de `domain/`.
- [ ] Nenhuma prop que desenha: estrutura vem de `children` e de partes.
- [ ] A lógica com estado está em um hook, não no corpo do componente.
- [ ] Todo card clicável usa `Pressable`, e não um `onClick` solto em um `Box`.
- [ ] Todo link de texto usa o `Link` do design system, e não o `Link` cru do router.
- [ ] Nenhuma tela do app tem cópia de um componente que já existe em `base/` ou `domain/`.
- [ ] Todo botão tem `tone`, não `variant` solto.
- [ ] Todo estado de seleção usa a borda de seleção, e todo foco usa a borda interna — nunca outline.
- [ ] Alvo de toque de no mínimo 44px.
- [ ] Cor nunca é a única informação: sempre com ícone ou rótulo.
- [ ] A superfície tem os cinco estados.

---

## 8. Regras de uso

**Cor nunca sozinha.** Vida, stamina e elemento vêm com cor **e** com ícone ou rótulo. Oito por cento dos homens tem alguma deficiência de visão de cores, e cor sozinha torna o jogo injogável para eles.

**Sombra para profundidade, borda para estado.** Painel, cartão e slot usam sombra em camadas. Borda fica para o que comunica estado ou separa layout: o traço do slot selecionado, o divisor do rodapé, a borda do campo de texto.

**Estado sem brilho.** Seleção e foco se marcam com **borda**, nunca com um outline fora do bloco: o foco é uma borda interna de 2px em `arcane.500` e a seleção é a borda do próprio elemento em `arcane.400`. Elevação e marcador de canto completam. Nenhum estado usa halo, sombra colorida que se dissolve ou gradiente de fade: são eles que fazem a interface parecer uma vitrine em vez de um jogo.

**Raios concêntricos.** O raio externo é o raio interno mais o padding entre eles.

**Grade com coluna do tamanho do slot.** Uma grade de `1fr` com slot de tamanho fixo deixa espaço sobrando em cada célula. A coluna tem a largura do slot e a grade começa no canto.

**Campo de texto com 16px.** O Chakra define o input em 14px, e 14px no campo mais o placeholder apagado dá leitura ruim. O `TextField` sobe para 16px, o que também evita o zoom automático do iOS ao focar.

**Texto nítido.** O `text-rendering` fica em `auto`: o padrão do Chakra, `optimizelegibility`, desliga o hinting e deixa o texto pequeno serrilhado. O `-webkit-font-smoothing: antialiased` **não** é aplicado: é um truque de macOS e no Linux derruba a qualidade.

**Fundo chapado.** Gradiente no fundo compete com o que está sobre ele e suja a leitura do canvas.

**Movimento é comunicação.** A animação diz que algo mudou. Duração curta, entrada com opacidade, escala e desfoque, e nada quando o sistema pede movimento reduzido. Toda transição é interrompível, para o jogador poder mudar de intenção no meio.

**Raios de toque.** Todo alvo de toque tem no mínimo 44px, e 48px para as ações importantes. O alvo é maior que o elemento visível.

**Estados obrigatórios.** Toda superfície que carrega ou aceita dados renderiza os cinco estados: carregando, vazio, erro, populado e limite. O estado populado é o que se desenha primeiro e o que mais some.

---

## 9. A galeria

A rota `/design-system` mostra o sistema funcionando. Ela é pública e serve de referência viva.

A galeria é a **referência viva** do que vai para a tela. Onde ela mostra um componente, é o componente real do app — nunca um mock paralelo.

A barra superior da galeria é a `Toolbar` de `components/domain/game/`, a mesma do jogo. É por isso que dá para ver, na própria galeria, se a interface do jogo está certa.

| Ordem | Seção | O que mostra |
| --- | --- | --- |
| 1 | Cores | As sete escalas completas |
| 2 | Tipografia | Os nove estilos de texto |
| 3 | Superfícies | Frame, Slot, Chip com tons e as sombras |
| 4 | Componentes | Botão (tom e paleta), campo com clean, slot, cooldown, popup, camadas e barras de recurso |
| 5 | Ícones | Os dezenove ícones |
| 6 | Estados | Os cinco estados, o alerta real, o popup e os modos de camada |
| 7 | Tela do jogo | A tela completa, com barra de habilidades e loja |
| 8 | Outras telas | Autenticação, treinadores, cidade e caçada |

**Modal com tamanho fixo.** Modal e drawer têm altura e largura declaradas, e o corpo é que rola. Um modal que encolhe e cresce com o conteúdo pisca a cada linha que entra ou sai.

**A anatomia é a mesma em toda parte.** Cabeçalho, corpo e rodapé. O que muda é quem monta: o `ModalHeader` centraliza o título e o `CloseControl` fica no canto do painel; o `FrameHeader` é um cabeçalho de seção dentro de um painel.

**O `Text` do design system é o único que escreve texto.** O `Text` do Chakra com `textStyle` — ou qualquer `fontSize` solto — é código que sai do sistema e volta a divergir.

**Modal simples e modal composto são o mesmo componente.** Um diálogo de confirmação e a loja usam o mesmo `Modal` com o mesmo `ModalHeader`, `ModalBody` e `ModalFooter`. A diferença é só o tamanho e o que cabe dentro — nunca um componente paralelo.

---

## 10. Pendências

- Os valores de tamanho mínimo e máximo da escala da interface.
- A cor de destaque dos elementos ativos, que o sistema chama de `state.selected` e ainda não tem valor definido.
- A escala acima de 1,0, para telas grandes.
- A arte final de criatura e de item, que hoje são círculos e quadrados de cor.
- A migração dos modais compostos do app — loja, armazenamento e a mochila ainda são mock na galeria. A área de caça e o drawer de detalhe já seguem os mockups de `docs/assets/`.
- A arte final de criatura e de item, que hoje são círculos e quadrados de cor.
