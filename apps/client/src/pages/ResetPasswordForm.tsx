import { Box, Stack } from '@chakra-ui/react';
import type { FormEvent, ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  type AuthErrorCode,
  type AuthResult,
  PASSWORD_MAX,
  PASSWORD_MIN,
} from '~/auth/store/types';
import { useAuth } from '~/auth/useAuth';
import { useAlerts } from '~/components/base/alert/useAlerts';
import { Button } from '~/components/base/button/Button';
import { Link } from '~/components/base/link/Link';
import { Text } from '~/components/base/text/Text';
import { AuthField } from '~/components/domain/auth/AuthField';
import { FieldError } from '~/components/domain/auth/FieldError';
import { usePasswordResetForm } from '~/pages/usePasswordResetForm';

const WEAK_PASSWORD_ERROR = `A senha deve ter no mínimo ${PASSWORD_MIN} caracteres.`;
const MISMATCH_PASSWORD_ERROR = 'As senhas não conferem.';
const NETWORK_ERROR = 'Erro de conexão. Tente novamente.';
const SIGNIN_PATH = '/signin';
const FORGOT_PASSWORD_PATH = '/forgot-password';
const ALERT_DURATION = 6000;
const FORM_LABEL = 'Redefinir senha';
const SUCCESS_LABEL = 'Senha redefinida com sucesso. Faça login para continuar.';
const SUCCESS_ICON = '✓';

export function ResetPasswordForm(): ReactElement {
  const auth = useAuth();
  const { show } = useAlerts();
  const navigate = useNavigate();
  const form = usePasswordResetForm();

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (form.isSubmitting) {
      return;
    }
    const validationError = validate(form.password, form.confirmPassword);
    if (validationError !== null) {
      form.setError(validationError);
      return;
    }
    form.setIsSubmitting(true);
    auth
      .updatePassword(form.password)
      .then(
        handleAuthResult(navigate, show, form.setError, form.setIsSubmitting, auth.signOut),
        handleAuthFailure(form.setError, form.setIsSubmitting),
      );
  }

  return (
    <ResetPasswordFormView
      confirmPassword={form.confirmPassword}
      error={form.error}
      isSubmitting={form.isSubmitting}
      onConfirmPasswordChange={form.handleConfirmPasswordChange}
      onPasswordChange={form.handlePasswordChange}
      onSubmit={handleSubmit}
      password={form.password}
    />
  );
}

type ResetPasswordFormViewProps = {
  confirmPassword: string;
  error: string;
  isSubmitting: boolean;
  onConfirmPasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  password: string;
};

function ResetPasswordFormView(props: ResetPasswordFormViewProps): ReactElement {
  const {
    confirmPassword,
    error,
    isSubmitting,
    onConfirmPasswordChange,
    onPasswordChange,
    onSubmit,
    password,
  } = props;
  const errorNode = renderError(error);
  return (
    <form aria-label={FORM_LABEL} noValidate onSubmit={onSubmit}>
      <Stack gap={4}>
        <AuthField
          autoComplete="new-password"
          label="Nova senha"
          name="password"
          onChange={onPasswordChange}
          placeholder="Sua nova senha"
          type="password"
          value={password}
        />
        <AuthField
          autoComplete="new-password"
          label="Confirmar senha"
          name="confirmPassword"
          onChange={onConfirmPasswordChange}
          placeholder="Repita a senha"
          type="password"
          value={confirmPassword}
        />
        {errorNode}
        <Button tone="primary" disabled={isSubmitting} loading={isSubmitting} type="submit">
          Redefinir senha
        </Button>
        <Link to={FORGOT_PASSWORD_PATH} tone="secondary" width="full">
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
  return <FieldError message={message} />;
}

function validate(password: string, confirmPassword: string): string | null {
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return WEAK_PASSWORD_ERROR;
  }
  if (password !== confirmPassword) {
    return MISMATCH_PASSWORD_ERROR;
  }
  return null;
}

function handleAuthResult(
  navigate: ReturnType<typeof useNavigate>,
  show: (input: { content: ReactElement; duration: number; icon: ReactElement }) => string,
  setError: (message: string) => void,
  setIsSubmitting: (value: boolean) => void,
  signOut: () => Promise<void>,
): (result: AuthResult) => void {
  return function handle(result: AuthResult): void {
    setIsSubmitting(false);
    if (result.ok) {
      show({ content: <SuccessMessage />, duration: ALERT_DURATION, icon: <AlertIcon /> });
      signOut().then(redirectToSignin(navigate), noop);
      return;
    }
    setError(messageForError(result.code));
  };
}

function redirectToSignin(navigate: ReturnType<typeof useNavigate>): () => void {
  return function redirect(): void {
    navigate(SIGNIN_PATH, { replace: true });
  };
}

function noop(): void {
  void 0;
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
    case 'weak_password':
      return WEAK_PASSWORD_ERROR;
    case 'same_password':
      return 'A nova senha deve ser diferente da atual.';
    case 'network':
      return NETWORK_ERROR;
    case 'rate_limited':
      return 'Muitas tentativas. Tente novamente em alguns minutos.';
    default:
      return 'Não foi possível redefinir a senha.';
  }
}

function SuccessMessage(): ReactElement {
  return <Text color="fg">{SUCCESS_LABEL}</Text>;
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
      {SUCCESS_ICON}
    </Box>
  );
}
