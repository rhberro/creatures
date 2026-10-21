import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Control, UseFormReturn } from 'react-hook-form';
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
import { useAlerts } from '~/shared/ui/alert';
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

type GoogleSignIn = {
  handleGoogleClick: () => void;
  isOAuthPending: boolean;
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
  const alerts = useAlerts();
  const form = useZodForm(signUpSchema, { confirmPassword: '', email: '', password: '' });
  const setFormError = buildFormErrorSetter(form);
  const handleResult = buildSignUpResultHandler(
    navigate,
    setFormError,
    alerts.show,
    readSubmittedEmail(form),
  );
  const handleAuthFailure = buildAuthFailureHandler(setFormError, SIGNUP_MESSAGES.networkError);
  const google = useGoogleSignIn(auth.signInWithGoogle, handleResult, handleAuthFailure);

  function onSubmit(values: SignUpValues): Promise<void> {
    const credentials = { email: values.email, password: values.password };
    return auth.signUp(credentials).then(handleResult, handleAuthFailure);
  }

  return {
    control: form.control,
    formError: readFormError(form),
    handleGoogleClick: google.handleGoogleClick,
    handleSubmit: form.handleSubmit(onSubmit),
    isBusy: form.formState.isSubmitting || google.isOAuthPending,
    isOAuthPending: google.isOAuthPending,
    isSubmitting: form.formState.isSubmitting,
  };
}

/**
 * O login com Google.
 *
 * Ele nao e o envio do formulario: e um botao ao lado dele, e por isso que
 * ele tem o seu proprio estado de pendencia.
 */
function useGoogleSignIn(
  signInWithGoogle: () => Promise<AuthResult>,
  handleResult: (result: AuthResult) => void,
  handleFailure: () => void,
): GoogleSignIn {
  const [isOAuthPending, setIsOAuthPending] = useState<boolean>(false);

  function handleSuccess(result: AuthResult): void {
    setIsOAuthPending(false);
    handleResult(result);
  }

  function handleRejected(): void {
    setIsOAuthPending(false);
    handleFailure();
  }

  function handleClick(): void {
    if (isOAuthPending) {
      return;
    }
    setIsOAuthPending(true);
    signInWithGoogle().then(handleSuccess, handleRejected);
  }

  return { handleGoogleClick: handleClick, isOAuthPending };
}

/**
 * O e-mail que o jogador escreveu.
 *
 * O aviso do e-mail pendente precisa dizer para qual endereco o link foi
 * enviado, e ele e lido do formulario no momento do aviso.
 */
function readSubmittedEmail(form: UseFormReturn<SignUpValues>): () => string {
  return function readEmail(): string {
    return form.getValues('email');
  };
}
