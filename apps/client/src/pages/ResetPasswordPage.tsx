import { Box, Center, Spinner } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { useAuth } from '~/auth/useAuth';
import { Link } from '~/components/base/link/Link';
import { Text } from '~/components/base/text/Text';
import { AuthPage } from '~/components/domain/auth/AuthPage';
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
  return <AuthPage title={title}>{children}</AuthPage>;
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
    <AuthPage title="Link inválido">
      <Text color="fg.muted" textAlign="center" variant="body">
        Este link de recuperação é inválido, expirou ou já foi utilizado.
      </Text>
      <Box display="flex" justifyContent="center">
        <Link to={FORGOT_PASSWORD_PATH} variant="label">
          Solicite um novo link.
        </Link>
      </Box>
    </AuthPage>
  );
}
