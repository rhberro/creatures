# Estilos de Código

## Logging

Use o logger estruturado (pino) em `services/` e em qualquer código de servidor em `apps/`. Não use `console.log`/`console.error` fora de depuração local rápida, que é removida antes do commit.

## Comentários

Sem comentários, a menos que expliquem um _porquê_ não óbvio — uma restrição oculta, uma gambiarra, um detalhe sutil. Nunca expliquem o _o quê_ o código faz: funções e variáveis bem nomeadas já fazem isso.

## Parâmetros e destructuring

Faça destructuring dentro do corpo da função, e não na assinatura:

```ts
function updatePlayer(props: UpdatePlayerProps) {
  const { id, name } = props;
  // ...
}
```

e não:

```ts
function updatePlayer({ id, name }: UpdatePlayerProps) {
  // ...
}
```

## Declare antes de usar — sem funções, objetos ou arrays inline

Não defina uma função, objeto ou array literal no ponto em que ele é usado — como prop de JSX ou como argumento de chamada. Declare antes (no escopo do módulo se for estático, no corpo da função se depender de props/estado) e passe pelo nome:

```tsx
const hoverStyle = { borderColor: "blue.300" };

function TrainerCard(props: TrainerCardProps): ReactElement {
  const { onSelect, trainer } = props;

  return (
    <Box _hover={hoverStyle} onClick={onSelect}>
      ...
    </Box>
  );
}
```

e não:

```tsx
function TrainerCard(props: TrainerCardProps): ReactElement {
  const { onSelect, trainer } = props;

  return (
    <Box _hover={{ borderColor: "blue.300" }} onClick={() => onSelect(trainer.id)}>
      ...
    </Box>
  );
}
```

Vale para qualquer argumento de chamada e qualquer valor de prop de JSX — handlers de evento, objetos de configuração, parâmetros com valor padrão. A única prop isenta é `key`. A regra também alcança chamadas aninhadas dentro de um literal que já está sendo declarado: um array passado a `z.enum([...])` dentro de um objeto continua precisando do próprio nome — estar dentro de outro literal não isenta a chamada interna.

**Exceção — callbacks.** Uma função pode ficar inline quando o callee for um hook React (`useState`, `useEffect`, `useMemo`, `useCallback`, `useReducer`, `useRef`, `useContext`, `useTransition`, `useId`, `use`), um método de array (`map`, `filter`, `reduce`, `sort`, `find`, `forEach`, `some`, `every`, `slice`, `flatMap`) ou um método de promise (`then`, `catch`, `finally`):

```tsx
const trainerCards = trainers.map((trainer) => (
  <TrainerCard key={trainer.id} trainer={trainer} />
));
```

Para hook, a chamada precisa ser direta pelo nome — `React.useMemo(() => ...)` não entra na exceção. E a exceção vale só para funções: objetos e arrays inline continuam proibidos, então `useState({ open: false })` precisa de uma constante declarada antes:

```tsx
const INITIAL_DIALOG_STATE = { open: false };

const [dialogState, setDialogState] = useState(INITIAL_DIALOG_STATE);
```

**Arrays de dependência de hook são a exceção que não tem saída.** O segundo argumento de `useEffect`/`useCallback`/`useMemo` é um array literal, e a regra o barra como qualquer outro array inline — inclusive `[]`. Declarar as dependências em um `const` antes não resolve, porque o React exige o array literal na posição. O padrão do projeto é manter o literal inline e silenciar a regra na linha:

```tsx
useEffect((): void => {
  load();
  // oxlint-disable-next-line oxlint-plugins/no-inline-functions-objects-arrays
}, [load]);
```

Dois motivos, e os dois são regra, não preferência:

- **Legibilidade.** Uma declaração nomeada é lida de cima para baixo: o leitor vê o nome (`hoverStyle`, `trainerCards`) antes de precisar entender o conteúdo, em vez de parsear um bloco anônimo no meio da chamada.
- **Estabilidade de referência.** Um literal escrito inline é uma referência nova a cada render. Passado como prop, faz o componente receptor ver uma prop "mudada" mesmo quando o conteúdo é idêntico — isso quebra `React.memo` e as arrays de dependência de `useEffect`/`useMemo`/`useCallback`, causando re-renders e re-execuções de efeito difíceis de rastrear.

Regra de bolso: o argumento de uma chamada ou o valor de uma prop de JSX deve ser uma referência nua a algo já declarado (variável, prop, cadeia de acesso a propriedade), um literal primitivo escrito como ele mesmo (`"ok"`, `404`, `true`) ou um callback inline nos casos da exceção acima — nunca um objeto, array ou função construídos naquela posição.

## Containers de expressão JSX: sem computação inline

Um container de expressão JSX — o `{...}` entre tags que insere um valor — deve conter apenas uma referência a algo já computado: uma variável, uma prop, uma cadeia de acesso a propriedade (`trainer.name`) ou um template literal sem interpolação. Nunca escreva transformação, condicional ou destructuring direto dentro do `{}`. Compute antes do `return` (ou no escopo do módulo, se não depender de props/estado) e referencie a constante no JSX.

Isso cobre, no mínimo:

- Transformações de array: `.map()`, `.filter()`, `.reduce()`, `.sort()`, `.find()`, `.flatMap()`
- Renderização condicional: `condicao ? <A /> : <B />`, `condicao && <A />`
- Destructuring escrito inline dentro da expressão
- Template literal com interpolação: `` {`Nivel ${level}`} `` precisa virar `const levelLabel = ...`

```tsx
function TrainersList(props: TrainersListProps): ReactElement {
  const { createCardVisible, trainers } = props;
  const trainerCards = trainers.map((trainer) => (
    <TrainerCard key={trainer.id} trainer={trainer} />
  ));
  const createCard = createCardVisible ? <CreateTrainerCard onClick={onCreate} /> : null;

  return (
    <Stack gap={3}>
      {trainerCards}
      {createCard}
    </Stack>
  );
}
```

e não:

```tsx
function TrainersList(props: TrainersListProps): ReactElement {
  const { createCardVisible, trainers } = props;

  return (
    <Stack gap={3}>
      {trainers.map((trainer) => (
        <TrainerCard key={trainer.id} trainer={trainer} />
      ))}
      {createCardVisible ? <CreateTrainerCard onClick={onCreate} /> : null}
    </Stack>
  );
}
```

Por quê: quem lê JSX está parseando estrutura de marcação. Cada `{...}` com lógica força o leitor a parar e executar código mentalmente no meio do layout. A constante nomeada separa _o que é computado_ de _onde é usado_ — o JSX vira uma lista plana de placeholders, e cada computação ganha um nome que declara sua intenção antes de aparecer. É o caso JSX-específico de [Declare antes de usar](#declare-antes-de-usar--sem-funções-objetos-ou-arrays-inline); está separado aqui porque a sintaxe `{}` do JSX incentiva o hábito de escrever lógica inline.

## Componentes React

Declarações de função, seguindo a regra de não usar arrow functions:

```tsx
function PlayerCard(props: PlayerCardProps) {
  const { name, level } = props;
  return <div>...</div>;
}
```

e não:

```tsx
const PlayerCard = (props: PlayerCardProps) => { ... }
```
