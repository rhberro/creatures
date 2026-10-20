import type { ReactElement } from 'react';

import { NativeButton } from '~/components/base/button/NativeButton';

import type { PressableProps } from './pressable.types';

const PRESSABLE_HOVER = { filter: 'brightness(1.14)' };

export function Pressable(props: PressableProps): ReactElement {
  const { children, disabled = false, onPress, radius = 'sm', width } = props;
  const cursor = disabled ? 'not-allowed' : 'pointer';
  const opacity = disabled ? 0.5 : 1;

  return (
    <NativeButton
      _hover={PRESSABLE_HOVER}
      borderRadius={radius}
      cursor={cursor}
      disabled={disabled}
      opacity={opacity}
      transitionProperty="background-color"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
      width={width}
      onClick={onPress}
    >
      {children}
    </NativeButton>
  );
}
