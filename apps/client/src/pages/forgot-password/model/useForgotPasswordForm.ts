import type { FormEvent } from 'react';
import type { Control } from 'react-hook-form';

import {
  buildAuthFailureHandler,
  buildForgotResultHandler,
  FORGOT_MESSAGES,
  forgotPasswordSchema,
} from '~/features/authentication';
import type { ForgotPasswordValues } from '~/features/authentication';
import { useAuth } from '~/shared/auth';
import { useAlerts } from '~/shared/ui/alert';
import { buildFormErrorSetter, readFormError, useZodForm } from '~/shared/ui/form';

export type ForgotPasswordForm = {
  control: Control<ForgotPasswordValues>;
  formError: string;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
};

/**
 * O formulario de recuperacao de senha.
 *
 * A resposta nao diz se o e-mail existe: o aviso e o mesmo nos dois casos, e
 * o que muda e o erro quando o envio falha.
 */
export function useForgotPasswordForm(): ForgotPasswordForm {
  const auth = useAuth();
  const { show } = useAlerts();
  const form = useZodForm(forgotPasswordSchema, { email: '' });
  const setFormError = buildFormErrorSetter(form);
  const handleAuthResult = buildForgotResultHandler(show, setFormError);
  const handleAuthFailure = buildAuthFailureHandler(setFormError, FORGOT_MESSAGES.networkError);

  function onSubmit(values: ForgotPasswordValues): Promise<void> {
    return auth.requestPasswordReset(values.email).then(handleAuthResult, handleAuthFailure);
  }

  return {
    control: form.control,
    formError: readFormError(form),
    handleSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
  };
}
