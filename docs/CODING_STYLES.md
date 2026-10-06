# Coding Styles

## Logging

Use the structured logger (pino) in `services/` and any server-side code in `apps/`. Don't use `console.log`/`console.error` outside of quick local debugging that gets removed before committing.

## Comments

No comments unless they explain a non-obvious _why_ — a hidden constraint, a workaround, a subtle invariant. Never explain _what_ the code does; well-named functions and variables already do that.

## Parameters & destructuring

Destructure inside the function body, not in the signature:

```ts
function updatePlayer(props: UpdatePlayerProps) {
  const { id, name } = props;
  // ...
}
```

not:

```ts
function updatePlayer(
  { id, name }: UpdatePlayerProps
) {
  // ...
}
```

## React components

Function declarations, matching the no-arrow-functions rule:

```tsx
function PlayerCard(props: PlayerCardProps) {
  const { name, level } = props;
  return <div>...</div>;
}
```

not:

```tsx
const PlayerCard = (props: PlayerCardProps) => { ... }
```
