import { Text as ChakraText } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { VARIANT_COLOR } from './text.constants';
import type { TextProps } from './text.types';

export function Text(props: TextProps): ReactElement {
  const { color, variant = 'body', ...rest } = props;
  const resolved = color ?? VARIANT_COLOR[variant];
  return (
    <ChakraText color={resolved} textStyle={variant} {...rest}>
      {rest.children}
    </ChakraText>
  );
}
