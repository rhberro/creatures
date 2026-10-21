import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

type CooldownProps = {
  remaining: number;
  total: number;
};

export function Cooldown(props: CooldownProps): ReactElement {
  const { remaining, total } = props;
  const progress = computeProgress(remaining, total);
  const height = `${progress * 100}%`;
  return (
    <Box
      bg="bg.veil"
      height={height}
      left="0"
      opacity="0.78"
      pointerEvents="none"
      position="absolute"
      top="0"
      transitionProperty="height"
      transitionDuration="180ms"
      transitionTimingFunction="ease-out"
      width="full"
    />
  );
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
