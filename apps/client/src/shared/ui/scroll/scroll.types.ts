import type { ComponentProps, ReactNode } from 'react';

export type ScrollAreaProps = Omit<
  ComponentProps<typeof import('@chakra-ui/react').Box>,
  'children'
> & {
  children: ReactNode;
};
