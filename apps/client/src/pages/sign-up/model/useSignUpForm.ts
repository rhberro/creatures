import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Control } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import {
  buildAuthFailureHandler,
  buildSignUpResultHandler,
  signUpSchema,
  SIGNUP_MESSAGES,
} from '~/features/authentication';
import type { SignUpValues } from '~/features/authentication';
import { useAuth } from '~/shared/auth';
import type { AuthResult } from '~/shared/auth';
import { buildFormErrorSetter, readFormError, useZodForm } from '~/shared/ui/form';

export type SignUpForm = {
  control: Control<SignUpValues>;
  formError: string;
  handleGoogleClick: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isBusy: boolean;
  isOAuthPending: boolean;
  isSubmitting: boolean;
};

/**
 * O formulario de cadastro.
 *
 * A confirmacao de senha e validada pelo schema: as duas senhas precisam
 * bater, e o erro aparece no campo da confirmacao, e nao no formulario.
 */
export function useSignUpForm(): SignUpForm {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isOAuthPending, setIsOAuthPending] = useState<boolean>(false);
  const form = useZodForm(signUpSchema, { confirmPassword: '', email: '', password: '' });
  const setFormError = buildFormErrorSetter(form);
  const handleAuthResult = buildSignUpResultHandler(navigate, setFormError);
  const handleOAuthResult = buildSignUpResultHandler(navigate, setFormError);
  const handleAuthFailure = buildAuthFailureHandler(setFormError, SIGNUP_MESSAGES.networkError);

  function onSubmit(values: SignUpValues): Promise<void> {
    const credentials = { email: values.email, password: values.password };
    return auth.signUp(credentials).then(handleAuthResult, handleAuthFailure);
  }

  function handleOAuthSuccess(result: AuthResult): void {
    setIsOAuthPending(false);
    handleOAuthResult(result);
  }

  function handleOAuthFailure(): void {
    setIsOAuthPending(false);
    handleAuthFailure();
  }

  function handleGoogleClick(): void {
    if (isOAuthPending) {
      return;
    }
    setIsOAuthPending(true);
    auth.signInWithGoogle().then(handleOAuthSuccess, handleOAuthFailure);
  }

  return {
    control: form.control,
    formError: readFormError(form),
    handleGoogleClick,
    handleSubmit: form.handleSubmit(onSubmit),
    isBusy: form.formState.isSubmitting || isOAuthPending,
    isOAuthPending,
    isSubmitting: form.formState.isSubmitting,
  };
}
