# Estilos de Código

As regras deste documento são adicionais e obrigatórias. Além delas, todo o código
deve seguir também os estilos descritos no
`node_modules/@rhberro/oxsome/CODING_STYLES.md`,
empacotado em `@rhberro/oxsome` e aplicado via `oxlint.config.ts`.

Os dois documentos são obrigatórios. Havendo conflito, valem as regras descritas
aqui.

## Logging

Use o logger estruturado (pino) em `services/` e em qualquer código de servidor em `apps/`. Não use `console.log`/`console.error` fora de depuração local rápida, que é removida antes do commit.

## Comentários

Sem comentários, a menos que expliquem um _porquê_ não óbvio — uma restrição oculta, uma gambiarra, um detalhe sutil. Nunca expliquem o _o quê_ o código faz: funções e variáveis bem nomeadas já fazem isso.

## Componentes React

Componente é declaração de função, seguindo a regra `oxsome/no-arrow-functions`.

isso sim:

```tsx
function PlayerCard(props: PlayerCardProps) {
  const { name, level } = props;
  return <div>...</div>;
}
```

isso não:

```tsx
const PlayerCard = (props: PlayerCardProps) => { ... }
```
