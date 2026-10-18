import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

export function CooldownShadow(props: CooldownShadowProps): ReactElement {
  const { remaining, total } = props;
  const progress = computeProgress(remaining, total);
  const heightStyle = buildHeightStyle(progress);
  return (
    <Box
      bg="blackAlpha.600"
      height={heightStyle}
      left="0"
      pointerEvents="none"
      position="absolute"
      top="0"
      width="full"
    />
  );
}

export type CooldownShadowProps = {
  remaining: number;
  total: number;
};

function buildHeightStyle(progress: number): string {
  return `${progress * 100}%`;
}

function computeProgress(remaining: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  const ratio = remaining / total;
  if (ratio < 0) {
    return 0;
  }
  if (ratio > 1) {
    return 1;
  }
  return ratio;
}
