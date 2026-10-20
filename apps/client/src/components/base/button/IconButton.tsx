import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { FOCUS_BORDER } from '~/theme/focus';

import { ICON_BUTTON_TONE } from './iconButton.constants';
import type { IconButtonProps } from './iconButton.types';

const ICON_BUTTON_SIZE = '44px';

export function IconButton(props: IconButtonProps): ReactElement {
  const { children, label, onClick, size = ICON_BUTTON_SIZE, tone = 'neutral' } = props;
  const colors = ICON_BUTTON_TONE[tone];
  return (
    <Box
      _focusVisible={FOCUS_BORDER}
      alignItems="center"
      aria-label={label}
      bg={colors.background}
      borderColor={colors.borderColor}
      borderRadius="sm"
      borderWidth={colors.borderWidth}
      boxShadow="sm"
      color={colors.color}
      cursor="pointer"
      display="flex"
      height={size}
      justifyContent="center"
      role="button"
      tabIndex={0}
      title={label}
      transitionProperty="background-color, color"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
      width={size}
      onClick={onClick}
    >
      {children}
    </Box>
  );
}
