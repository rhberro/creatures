import { Box, Heading } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { AuthCard } from '~/pages/AuthCard';
import { ForgotPasswordForm } from '~/pages/ForgotPasswordForm';

export function ForgotPasswordPage(): ReactElement {
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
      <Box mb={8}>
        <Heading color="fg" size="3xl">
          Creatures
        </Heading>
      </Box>
      <AuthCard title="Recuperar Conta">
        <ForgotPasswordForm />
      </AuthCard>
    </Box>
  );
}
