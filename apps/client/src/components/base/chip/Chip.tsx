import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { NativeButton } from '~/components/base/button/NativeButton';
import { Text } from '~/components/base/text/Text';

import { CHIP_TONE_COLORS, SKEW, SKEW_BACK } from './chip.constants';
import type { ChipProps } from './chip.types';

/**
 * O filtro inclinado.
 *
 * Nao e aba: e um botao que alterna. Por isso ele carrega `aria-pressed`, e o
 * texto entra como `children` — nunca como `label`.
 */
export function Chip(props: ChipProps): ReactElement {
  const { active = false, children, disabled = false, onClick, tone = 'neutral' } = props;
  const colors = CHIP_TONE_COLORS[tone];
  const background = active ? colors.activeBackground : 'bg.raised';
  const borderColor = active ? colors.activeBorder : colors.idleBorder;
  const color = active ? colors.activeColor : disabled ? 'fg.subtle' : colors.idleColor;
  const cursor = disabled ? 'not-allowed' : 'pointer';
  const opacity = disabled ? 0.5 : 1;
  const shadow = active ? 'sm' : 'none';
  return (
    <NativeButton
      aria-pressed={active}
      bg={background}
      borderColor={borderColor}
      borderRadius="sm"
      borderWidth="1px"
      boxShadow={shadow}
      color={color}
      cursor={cursor}
      disabled={disabled}
      opacity={opacity}
      paddingBlock="1.5"
      paddingInline="4"
      transitionProperty="background-color, border-color, box-shadow, color, transform"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
      transform={SKEW}
      onClick={onClick}
    >
      <Box alignItems="center" display="flex" gap="2" transform={SKEW_BACK}>
        <Text variant="label">{children}</Text>
      </Box>
    </NativeButton>
  );
}
