import { Link as ChakraLink } from '@chakra-ui/react';
import type { MouseEvent, ReactElement } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import type { LinkProps as RouterLinkProps } from 'react-router-dom';

import { Button } from '~/shared/ui/button';

import {
  LINK_COLOR,
  LINK_DISABLED_COLOR,
  LINK_HOVER,
  LINK_TRANSITION_DURATION,
  LINK_TRANSITION_EASING,
  LINK_TRANSITION_PROPERTY,
  LINK_UNDERLINE_OFFSET,
} from './link.constants';
import type { LinkProps } from './link.types';

export function Link(props: LinkProps): ReactElement {
  const {
    children,
    disabled = false,
    onClick,
    replace,
    state,
    to,
    tone,
    variant = 'body',
    width,
  } = props;
  const routerProps = buildRouterProps(disabled, onClick, replace, state, to);

  if (tone !== undefined) {
    return (
      <Button asChild disabled={disabled} tone={tone} width={width}>
        <RouterLink {...routerProps}>{children}</RouterLink>
      </Button>
    );
  }

  const textStyles = buildTextStyles(width);
  const color = disabled ? LINK_DISABLED_COLOR : LINK_COLOR;
  const hover = disabled ? undefined : LINK_HOVER;

  return (
    <ChakraLink
      _hover={hover}
      asChild
      color={color}
      css={textStyles}
      textDecorationColor="currentColor"
      textDecorationLine="underline"
      textStyle={variant}
      textUnderlineOffset={LINK_UNDERLINE_OFFSET}
      transitionDuration={LINK_TRANSITION_DURATION}
      transitionProperty={LINK_TRANSITION_PROPERTY}
      transitionTimingFunction={LINK_TRANSITION_EASING}
    >
      <RouterLink {...routerProps}>{children}</RouterLink>
    </ChakraLink>
  );
}

/**
 * As props do `RouterLink`, com o tratamento do estado desabilitado.
 *
 * Um `<a>` desabilitado continua clicavel: o navegador nao desabilita link.
 * Por isso o desabilitado ganha `aria-disabled`, sai da ordem de tabulacao e
 * tem o clique cancelado — sem chamar o `onClick` de quem usa o link.
 */
function buildRouterProps(
  disabled: boolean,
  onClick: RouterLinkProps['onClick'],
  replace: RouterLinkProps['replace'],
  state: RouterLinkProps['state'],
  to: RouterLinkProps['to'],
): RouterLinkProps {
  if (!disabled) {
    return { onClick, replace, state, to };
  }
  return {
    'aria-disabled': true,
    onClick: preventClick,
    replace,
    state,
    tabIndex: -1,
    to,
  };
}

function preventClick(event: MouseEvent<HTMLAnchorElement>): void {
  event.preventDefault();
}

/**
 * O link de texto e um `<a>` inline: ele ignora `width`. Com `width`, ele
 * vira `inline-block` para a largura valer.
 */
function buildTextStyles(width: string | undefined): Record<string, unknown> {
  if (width === undefined) {
    return {};
  }
  return { display: 'inline-block' };
}
