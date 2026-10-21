import type { MouseEventHandler, ReactNode } from 'react';
import type { LinkProps as RouterLinkProps } from 'react-router-dom';

import type { ButtonTone } from '~/shared/ui/button';
import type { TextVariant } from '~/shared/ui/text';

export type LinkProps = {
  children: ReactNode;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  replace?: boolean;
  state?: RouterLinkProps['state'];
  to: string;
  tone?: ButtonTone;
  variant?: TextVariant;
  width?: string;
};
