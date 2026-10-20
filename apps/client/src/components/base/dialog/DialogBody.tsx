import { Dialog as ChakraDialog } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

type DialogBodyProps = {
  children: ReactNode;
};

export function DialogBody(props: DialogBodyProps): ReactElement {
  const { children } = props;
  return (
    <ChakraDialog.Body flex="1" minH="0" overflowY="auto" padding="4">
      {children}
    </ChakraDialog.Body>
  );
}
