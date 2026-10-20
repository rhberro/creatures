import type { MouseEventHandler, ReactNode } from 'react';
import type { LinkProps as RouterLinkProps } from 'react-router-dom';

import type { ButtonTone } from '~/components/base/button/button.types';
import type { TextVariant } from '~/components/base/text/text.types';

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
