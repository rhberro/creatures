import { Button as ChakraButton } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { FOCUS_RING } from '~/theme/focus';

import { TONE_PALETTE, TONE_VARIANT } from './button.constants';
import type { ButtonProps } from './button.types';

export function Button(props: ButtonProps): ReactElement {
  const { palette, tone = 'secondary', ...rest } = props;
  const resolvedPalette = palette ?? TONE_PALETTE[tone];
  const variant = TONE_VARIANT[tone];
  return (
    <ChakraButton
      _focusVisible={FOCUS_RING}
      colorPalette={resolvedPalette}
      textStyle="label"
      variant={variant}
      {...rest}
    >
      {rest.children}
    </ChakraButton>
  );
}
