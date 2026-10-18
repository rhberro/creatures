import { Box } from '@chakra-ui/react';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

export function ScrollArea(props: ScrollAreaProps): ReactElement {
  const { children, ...rest } = props;
  return (
    <Box overflow="auto" scrollbarGutter="stable" {...rest}>
      {children}
    </Box>
  );
}

export type ScrollAreaProps = Omit<ComponentProps<typeof Box>, 'children'> & {
  children: ReactNode;
};
