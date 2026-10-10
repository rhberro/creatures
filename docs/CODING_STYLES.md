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
