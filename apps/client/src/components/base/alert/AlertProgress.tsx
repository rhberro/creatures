import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

type AlertProgressProps = {
  duration: number;
  remaining: number;
};

export function AlertProgress(props: AlertProgressProps): ReactElement {
  const { duration, remaining } = props;
  const width = computeBarWidth(remaining, duration);
  return (
    <Box
      bg="arcane.500"
      bottom="0"
      height="2px"
      left="0"
      position="absolute"
      transition="width 180ms linear"
      width={width}
    />
  );
}

function computeBarWidth(remaining: number, duration: number): string {
  if (duration <= 0) {
    return '0%';
  }
  const ratio = remaining / duration;
  if (ratio < 0) {
    return '0%';
  }
  if (ratio > 1) {
    return '100%';
  }
  return `${ratio * 100}%`;
}
