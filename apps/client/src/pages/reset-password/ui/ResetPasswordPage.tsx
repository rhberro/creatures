import { Box, Center, Spinner } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { useAuth } from '~/shared/auth';
import { BrandPage } from '~/shared/ui/brand';
import { Link } from '~/shared/ui/link';
import { Text } from '~/shared/ui/text';

import { ResetPasswordForm } from './ResetPasswordForm';

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
  return <BrandPage title={title}>{children}</BrandPage>;
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
    <BrandPage title="Link inválido">
      <Text color="fg.muted" textAlign="center" variant="body">
        Este link de recuperação é inválido, expirou ou já foi utilizado.
      </Text>
      <Box display="flex" justifyContent="center">
        <Link to={FORGOT_PASSWORD_PATH} variant="label">
          Solicite um novo link.
        </Link>
      </Box>
    </BrandPage>
  );
}
