import { Tabs as ChakraTabs } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import type { TabsProps } from './tab.types';

/**
 * As abas.
 *
 * Sao as `Tabs` do Chakra (Ark UI): `role="tablist"`, `aria-selected`,
 * navegacao por setas e o conteudo associado por `aria-controls`. O que e
 * nosso e a aparencia — o sublinhado violeta da aba ativa.
 *
 * A raiz usa `display: contents` de proposito: assim a barra de abas e o
 * conteudo podem ficar em lados diferentes da tela sem criar uma caixa no
 * meio do layout.
 */
function buildValueChange(
  onValueChange: ((value: string) => void) | undefined,
): ((details: { value: string }) => void) | undefined {
  if (!onValueChange) {
    return undefined;
  }
  return function handleValueChange(details: { value: string }): void {
    onValueChange(details.value);
  };
}

export function Tabs(props: TabsProps): ReactElement {
  const { children, defaultValue, onValueChange, value } = props;
  const valueChange = buildValueChange(onValueChange);
  return (
    <ChakraTabs.Root
      defaultValue={defaultValue}
      display="contents"
      lazyMount
      onValueChange={valueChange}
      value={value}
      variant="plain"
    >
      {children}
    </ChakraTabs.Root>
  );
}
