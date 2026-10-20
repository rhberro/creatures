import { Tabs as ChakraTabs } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Text } from '~/components/base/text/Text';

import type { TabProps } from './tab.types';

/**
 * A aba.
 *
 * O sublinhado violeta e a barra rebaixada marcam a aba ativa. O estado vem
 * do contexto das `Tabs` — a aba nao recebe `active` por prop: quem sabe que
 * ela esta ativa e o proprio Ark UI, via `data-selected`.
 */
export function Tab(props: TabProps): ReactElement {
  const { children, value } = props;
  const activeStyles = buildActiveStyles();
  return (
    <ChakraTabs.Trigger
      bg="transparent"
      borderBottomStyle="solid"
      borderBottomWidth="2px"
      borderColor="transparent"
      color="fg.subtle"
      css={activeStyles}
      height="auto"
      minW="auto"
      paddingBlock="2"
      paddingInline="4"
      transitionProperty="background-color, border-color, color"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
      value={value}
    >
      <Text variant="label">{children}</Text>
    </ChakraTabs.Trigger>
  );
}

function buildActiveStyles(): Record<string, unknown> {
  return {
    // O Ark UI marca a aba ativa com `data-selected`, e nao com `data-state`.
    '&[data-selected]': {
      bg: 'bg.raised',
      borderColor: 'state.selected',
      color: 'fg',
    },
  };
}
