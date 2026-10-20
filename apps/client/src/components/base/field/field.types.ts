import type { ComponentProps } from 'react';

export type TextFieldProps = Omit<
  ComponentProps<typeof import('@chakra-ui/react').Input>,
  'children'
> & {
  clearable?: boolean;
};
