import { Box } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

type FormActionsProps = {
  children: ReactNode;
};

export function FormActions(props: FormActionsProps): ReactElement {
  const { children } = props;
  return (
    <Box display="flex" flexDirection="column" gap="2" marginBlockStart="1">
      {children}
    </Box>
  );
}
