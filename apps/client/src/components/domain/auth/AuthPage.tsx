import { Box } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

import { Wordmark } from '~/components/domain/brand/Wordmark';

import { AuthShell } from './AuthShell';

type AuthPageProps = {
  children: ReactNode;
  footer?: ReactNode;
  title: string;
};

export function AuthPage(props: AuthPageProps): ReactElement {
  const { children, footer, title } = props;
  return (
    <Box
      alignItems="center"
      as="main"
      bg="bg"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      minH="100dvh"
      p={6}
    >
      <Wordmark />
      <AuthShell footer={footer} title={title}>
        {children}
      </AuthShell>
    </Box>
  );
}
