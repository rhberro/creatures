import type { ReactElement } from 'react';

import { FOCUS_RING } from '~/theme/focus';

import { ICON_BUTTON_TONE } from './iconButton.constants';
import type { IconButtonProps } from './iconButton.types';
import { NativeButton } from './NativeButton';

const ICON_BUTTON_SIZE = '44px';

export function IconButton(props: IconButtonProps): ReactElement {
  const {
    children,
    label,
    onClick,
    radius = 'sm',
    size = ICON_BUTTON_SIZE,
    tone = 'neutral',
  } = props;
  const colors = ICON_BUTTON_TONE[tone];
  const hover = { bg: colors.hoverBackground, color: colors.hoverColor };
  return (
    <NativeButton
      _focusVisible={FOCUS_RING}
      _hover={hover}
      alignItems="center"
      aria-label={label}
      bg={colors.background}
      borderColor={colors.borderColor}
      borderRadius={radius}
      borderWidth={colors.borderWidth}
      boxShadow={colors.boxShadow}
      color={colors.color}
      cursor="pointer"
      display="flex"
      height={size}
      justifyContent="center"
      title={label}
      transitionProperty="background-color, color"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
      width={size}
      onClick={onClick}
    >
      {children}
    </NativeButton>
  );
}
