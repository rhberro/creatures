import { Box } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

type AuthActionsProps = {
  children: ReactNode;
};

export function AuthActions(props: AuthActionsProps): ReactElement {
  const { children } = props;
  return (
    <Box display="flex" flexDirection="column" gap="2" marginBlockStart="1">
      {children}
    </Box>
  );
}
