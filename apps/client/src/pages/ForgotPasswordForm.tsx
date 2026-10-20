import { Box, Stack } from '@chakra-ui/react';
import { useState, type FormEvent, type ReactElement } from 'react';

import type { AuthErrorCode, AuthResult } from '~/auth/store/types';
import { useAuth } from '~/auth/useAuth';
import { useAlerts } from '~/components/base/alert/useAlerts';
import { Button } from '~/components/base/button/Button';
import { Link } from '~/components/base/link/Link';
import { Text } from '~/components/base/text/Text';
import { AuthField } from '~/components/domain/auth/AuthField';

const GENERIC_MESSAGE =
  'Se o e-mail existir em nossa base de dados, enviamos um link de recuperação.';
const GENERIC_ERROR = 'Não foi possível enviar o link. Tente novamente.';
const NETWORK_ERROR = 'Erro de conexão. Tente novamente.';
const SIGNIN_PATH = '/signin';
const ALERT_DURATION = 6000;
const ALERT_ICON_LABEL = 'i';
const FORM_LABEL = 'Esqueci a senha';

export function ForgotPasswordForm(): ReactElement {
  const auth = useAuth();
  const { show } = useAlerts();
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  function handleEmailChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setEmail(event.target.value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    auth
      .requestPasswordReset(email)
      .then(
        handleAuthResult(show, setError, setIsSubmitting),
        handleAuthFailure(setError, setIsSubmitting),
      );
  }

  return (
    <ForgotPasswordFormView
      email={email}
      error={error}
      isSubmitting={isSubmitting}
      onEmailChange={handleEmailChange}
      onSubmit={handleSubmit}
    />
  );
}

type ForgotPasswordFormViewProps = {
  email: string;
  error: string;
  isSubmitting: boolean;
  onEmailChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

function ForgotPasswordFormView(props: ForgotPasswordFormViewProps): ReactElement {
  const { email, error, isSubmitting, onEmailChange, onSubmit } = props;
  const errorNode = renderError(error);
  return (
    <form aria-label={FORM_LABEL} noValidate onSubmit={onSubmit}>
      <Stack gap={4}>
        <AuthField
          autoComplete="email"
          label="E-mail"
          name="email"
          onChange={onEmailChange}
          placeholder="treinador@exemplo.com"
          type="email"
          value={email}
        />
        {errorNode}
        <Button tone="primary" disabled={isSubmitting} loading={isSubmitting} type="submit">
          Enviar
        </Button>
        <Link to={SIGNIN_PATH} tone="secondary" width="full">
          Voltar
        </Link>
      </Stack>
    </form>
  );
}

function renderError(message: string): ReactElement | null {
  if (message === '') {
    return null;
  }
  return (
    <Text color="fg.error" role="alert">
      {message}
    </Text>
  );
}

function handleAuthResult(
  show: (input: { content: ReactElement; duration: number; icon: ReactElement }) => string,
  setError: (message: string) => void,
  setIsSubmitting: (value: boolean) => void,
): (result: AuthResult) => void {
  return function handle(result: AuthResult): void {
    setIsSubmitting(false);
    show({ content: <AlertMessage />, duration: ALERT_DURATION, icon: <AlertIcon /> });
    if (!result.ok) {
      setError(messageForError(result.code));
    }
  };
}

function handleAuthFailure(
  setError: (message: string) => void,
  setIsSubmitting: (value: boolean) => void,
): (error: unknown) => void {
  return function handle(): void {
    setIsSubmitting(false);
    setError(NETWORK_ERROR);
  };
}

function messageForError(code: AuthErrorCode): string {
  switch (code) {
    case 'network':
      return NETWORK_ERROR;
    case 'rate_limited':
      return 'Muitas tentativas. Tente novamente em alguns minutos.';
    default:
      return GENERIC_ERROR;
  }
}

function AlertMessage(): ReactElement {
  return <Text color="fg">{GENERIC_MESSAGE}</Text>;
}

function AlertIcon(): ReactElement {
  return (
    <Box
      alignItems="center"
      bg="bg.muted"
      borderRadius="full"
      color="fg.muted"
      display="flex"
      h="6"
      justifyContent="center"
      w="6"
    >
      {ALERT_ICON_LABEL}
    </Box>
  );
}
