import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import { PASSWORD_MAX, PASSWORD_MIN } from '~/auth/store/types';
import { useAuth } from '~/auth/useAuth';
import {
  buildAuthFailureHandler,
  buildSignUpResultHandler,
  SIGNUP_MESSAGES,
} from '~/pages/authResultHandlers';
import type { SignUpFormState } from '~/pages/useSignUpForm';

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/u;

export type SignUpSubmit = {
  handleGoogleClick: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function useSignUpSubmit(form: SignUpFormState): SignUpSubmit {
  const auth = useAuth();
  const navigate = useNavigate();
  const handleAuthResult = buildSignUpResultHandler(navigate, form.setError, form.setIsSubmitting);
  const handleOAuthResult = buildSignUpResultHandler(navigate, form.setError, form.setIsSubmitting);
  const handleAuthFailure = buildAuthFailureHandler(
    form.setError,
    form.setIsSubmitting,
    SIGNUP_MESSAGES.networkError,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    if (form.isSubmitting) {
      return;
    }
    const validationError = validate(form.email, form.password, form.confirmPassword);
    if (validationError !== null) {
      form.setError(validationError);
      return;
    }
    form.setIsSubmitting(true);
    auth
      .signUp({ email: form.email, password: form.password })
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

function validate(email: string, password: string, confirmPassword: string): string | null {
  if (!EMAIL_PATTERN.test(email)) {
    return SIGNUP_MESSAGES.genericError;
  }
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    return SIGNUP_MESSAGES.weakPasswordError;
  }
  if (password !== confirmPassword) {
    return SIGNUP_MESSAGES.mismatchPasswordError;
  }
  return null;
}
