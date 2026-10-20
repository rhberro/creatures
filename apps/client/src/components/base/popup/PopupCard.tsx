import { Box } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

type PopupCardProps = {
  children: ReactNode;
  width?: string;
};

export function PopupCard(props: PopupCardProps): ReactElement {
  const { children, width = '240px' } = props;
  return (
    <Box
      bg="bg.panel"
      borderColor="border.emphasized"
      borderRadius="sm"
      borderWidth="1px"
      boxShadow="overlay"
      maxW="calc(100vw - 32px)"
      padding="3"
      width={width}
    >
      {children}
    </Box>
  );
}
