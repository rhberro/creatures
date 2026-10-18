import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '~/auth/useAuth';
import {
  buildAuthFailureHandler,
  buildOAuthResultHandler,
  buildSignInResultHandler,
  SIGNIN_MESSAGES,
} from '~/pages/authResultHandlers';
import type { EmailPasswordForm } from '~/pages/useEmailPasswordForm';

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/u;
const GENERIC_ERROR = 'E-mail ou senha inválidos.';

export type SignInSubmit = {
  handleGoogleClick: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function useSignInSubmit(form: EmailPasswordForm): SignInSubmit {
  const auth = useAuth();
  const navigate = useNavigate();
  const handleAuthResult = buildSignInResultHandler(navigate, form.setError, form.setIsSubmitting);
  const handleOAuthResult = buildOAuthResultHandler(form.setError, form.setIsSubmitting);
  const handleAuthFailure = buildAuthFailureHandler(
    form.setError,
    form.setIsSubmitting,
    SIGNIN_MESSAGES.networkError,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (form.isSubmitting) {
      return;
    }
    if (!EMAIL_PATTERN.test(form.email) || form.password.length === 0) {
      form.setError(GENERIC_ERROR);
      return;
    }
    form.setIsSubmitting(true);
    auth
      .signIn({ email: form.email, password: form.password })
      .then(handleAuthResult, handleAuthFailure);
  }

  function handleGoogleClick(): void {
    if (form.isSubmitting) {
      return;
    }
    form.setIsSubmitting(true);
    auth.signInWithGoogle().then(handleOAuthResult, handleAuthFailure);
  }

  return { handleGoogleClick, handleSubmit };
}
