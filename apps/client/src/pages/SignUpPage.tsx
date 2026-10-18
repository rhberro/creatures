import { Box, Heading } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { AuthCard } from '~/pages/AuthCard';
import { SignUpFooter } from '~/pages/SignUpFooter';
import { SignUpForm } from '~/pages/SignUpForm';

export function SignUpPage(): ReactElement {
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
      <AuthCard title="Criar Conta">
        <SignUpForm />
        <SignUpFooter />
      </AuthCard>
    </Box>
  );
}
