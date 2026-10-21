import { useState } from 'react';
import type { FormEvent } from 'react';
import type { Control } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import {
  buildAuthFailureHandler,
  buildOAuthResultHandler,
  buildSignInResultHandler,
  signInSchema,
  SIGNIN_MESSAGES,
} from '~/features/authentication';
import type { SignInValues } from '~/features/authentication';
import { useAuth } from '~/shared/auth';
import type { AuthResult } from '~/shared/auth';
import { buildFormErrorSetter, readFormError, useZodForm } from '~/shared/ui/form';

export type SignInForm = {
  control: Control<SignInValues>;
  formError: string;
  handleGoogleClick: () => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isBusy: boolean;
  isOAuthPending: boolean;
  isSubmitting: boolean;
};

/**
 * O formulario de entrada.
 *
 * O `useZodForm` devolve o formulario ja validado pelo schema, e o RHF cuida
 * do estado de envio: o `isSubmitting` fica verdadeiro desde o clique ate a
 * resposta do servidor. O botao de entrar mostra o carregamento nesse
 * intervalo, e nada mais aceita clique.
 *
 * O erro do formulario — "e-mail ou senha invalidos" — nao pertence a um
 * campo, entao ele mora na raiz do formulario. O erro de campo e o do campo.
 */
export function useSignInForm(): SignInForm {
  const auth = useAuth();
  const navigate = useNavigate();
  const [isOAuthPending, setIsOAuthPending] = useState<boolean>(false);
  const form = useZodForm(signInSchema, { email: '', password: '' });
  const setFormError = buildFormErrorSetter(form);
  const handleAuthResult = buildSignInResultHandler(navigate, setFormError);
  const handleOAuthResult = buildOAuthResultHandler(setFormError);
  const handleAuthFailure = buildAuthFailureHandler(setFormError, SIGNIN_MESSAGES.networkError);

  function onSubmit(values: SignInValues): Promise<void> {
    const credentials = { email: values.email, password: values.password };
    return auth.signIn(credentials).then(handleAuthResult, handleAuthFailure);
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
