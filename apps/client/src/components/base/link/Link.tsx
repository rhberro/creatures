import { Link as ChakraLink } from '@chakra-ui/react';
import type { ReactElement } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import { Button } from '~/components/base/button/Button';
import { FOCUS_BORDER } from '~/theme/focus';

import { LINK_COLOR, LINK_HOVER } from './link.constants';
import type { LinkProps } from './link.types';

export function Link(props: LinkProps): ReactElement {
  const { children, disabled, onClick, replace, state, to, tone, variant, width } = props;
  if (tone !== undefined) {
    return (
      <Button asChild disabled={disabled} tone={tone} width={width}>
        <RouterLink onClick={onClick} replace={replace} state={state} to={to}>
          {children}
        </RouterLink>
      </Button>
    );
  }
  return (
    <ChakraLink
      _focusVisible={FOCUS_BORDER}
      _hover={LINK_HOVER}
      asChild
      color={LINK_COLOR}
      fontWeight="600"
      textDecorationColor="currentColor"
      textDecorationLine="underline"
      textUnderlineOffset="3px"
      textStyle={variant}
      transitionProperty="color, text-decoration-color"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
      width={width}
    >
      <RouterLink onClick={onClick} replace={replace} state={state} to={to}>
        {children}
      </RouterLink>
    </ChakraLink>
  );
}
