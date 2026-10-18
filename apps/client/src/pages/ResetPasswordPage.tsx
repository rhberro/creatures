import { Box, Center, Heading, Spinner, Text } from '@chakra-ui/react';
import type { ReactElement } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '~/auth/useAuth';
import { AuthCard } from '~/pages/AuthCard';
import { ResetPasswordForm } from '~/pages/ResetPasswordForm';

const FORGOT_PASSWORD_PATH = '/forgot-password';

export function ResetPasswordPage(): ReactElement {
  const auth = useAuth();

  if (auth.status === 'INITIALIZING') {
    return <LoadingState />;
  }
  if (auth.status === 'RECOVERING' || auth.status === 'AUTHENTICATED') {
    return (
      <PageShell title="Redefinir senha">
        <ResetPasswordForm />
      </PageShell>
    );
  }
  return <InvalidLinkState />;
}

function PageShell(props: PageShellProps): ReactElement {
  const { children, title } = props;
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
      <AuthCard title={title}>{children}</AuthCard>
    </Box>
  );
}

type PageShellProps = {
  children: ReactElement;
  title: string;
};

function LoadingState(): ReactElement {
  return (
    <Center h="100dvh">
      <Spinner color="fg.muted" />
    </Center>
  );
}

function InvalidLinkState(): ReactElement {
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
      <AuthCard title="Link inválido">
        <Text color="fg" textAlign="center">
          Este link de recuperação é inválido, expirou ou já foi utilizado.
        </Text>
        <Box display="flex" justifyContent="center" mt={4}>
          <Link to={FORGOT_PASSWORD_PATH}>Solicite um novo link.</Link>
        </Box>
      </AuthCard>
    </Box>
  );
}
