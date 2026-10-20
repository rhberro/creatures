import type { ReactElement } from 'react';

import { NativeButton } from '~/components/base/button/NativeButton';
import { Text } from '~/components/base/text/Text';
import { FOCUS_RING } from '~/theme/focus';

import type { TabProps } from './tab.types';

export function Tab(props: TabProps): ReactElement {
  const { active = false, children } = props;
  const background = active ? 'bg.raised' : 'transparent';
  const borderColor = active ? 'arcane' : 'transparent';
  const color = active ? 'fg' : 'fg.subtle';
  return (
    <NativeButton
      _focusVisible={FOCUS_RING}
      bg={background}
      borderBottom="2px solid"
      borderColor={borderColor}
      color={color}
      cursor="pointer"
      paddingBlock="2"
      paddingInline="4"
      transitionProperty="background-color, border-color, color"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
    >
      <Text variant="label">{children}</Text>
    </NativeButton>
  );
}
