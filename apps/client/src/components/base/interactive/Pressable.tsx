import { Box } from '@chakra-ui/react';
import type { KeyboardEvent, ReactElement } from 'react';

import { FOCUS_BORDER } from '~/theme/focus';

import type { PressableProps } from './pressable.types';

const PRESSABLE_HOVER = { filter: 'brightness(1.14)' };

export function Pressable(props: PressableProps): ReactElement {
  const { children, disabled = false, onPress } = props;
  const tabIndex = disabled ? -1 : 0;
  const cursor = disabled ? 'not-allowed' : 'pointer';
  const opacity = disabled ? 0.5 : 1;

  function handleClick(): void {
    if (disabled) {
      return;
    }
    onPress();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (disabled) {
      return;
    }
    const isActivation = event.key === 'Enter' || event.key === ' ';
    if (isActivation) {
      event.preventDefault();
      onPress();
    }
  }

  return (
    <Box
      _focusVisible={FOCUS_BORDER}
      _hover={PRESSABLE_HOVER}
      aria-disabled={disabled}
      cursor={cursor}
      opacity={opacity}
      role="button"
      tabIndex={tabIndex}
      transitionProperty="background-color"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </Box>
  );
}
