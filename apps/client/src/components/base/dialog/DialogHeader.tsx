import { Dialog as ChakraDialog } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

type DialogHeaderProps = {
  children: ReactNode;
};

export function DialogHeader(props: DialogHeaderProps): ReactElement {
  const { children } = props;
  return (
    <ChakraDialog.Title
      borderBottom="1px solid"
      borderColor="border"
      color="fg"
      fontFamily="display"
      fontSize="lg"
      fontWeight="700"
      letterSpacing="0.04em"
      lineHeight="1.15"
      paddingBlock="3"
      paddingInline="4"
      textAlign="start"
      textTransform="uppercase"
    >
      {children}
    </ChakraDialog.Title>
  );
}
