import type { ComponentProps } from 'react';

export type TextProps = Omit<ComponentProps<typeof import('@chakra-ui/react').Text>, 'color'> & {
  color?: string;
  variant?: TextVariant;
};

export type TextVariant =
  | 'body'
  | 'bodyLarge'
  | 'display'
  | 'label'
  | 'meta'
  | 'name'
  | 'numeric'
  | 'section'
  | 'title';
