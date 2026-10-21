import type { FormEvent } from 'react';
import type { Control } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import {
  buildAuthFailureHandler,
  buildResetResultHandler,
  RESET_MESSAGES,
  resetPasswordSchema,
} from '~/features/authentication';
import type { ResetPasswordValues } from '~/features/authentication';
import { useAuth } from '~/shared/auth';
import { useAlerts } from '~/shared/ui/alert';
import { buildFormErrorSetter, readFormError, useZodForm } from '~/shared/ui/form';

export type ResetPasswordForm = {
  control: Control<ResetPasswordValues>;
  formError: string;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isSubmitting: boolean;
};

/**
 * O formulario de redefinicao de senha.
 *
 * Depois de trocar a senha, a sessao e encerrada: a senha nova vale para o
 * proximo login, e o jogador entra de novo.
 */
export function usePasswordResetForm(): ResetPasswordForm {
  const auth = useAuth();
  const { show } = useAlerts();
  const navigate = useNavigate();
  const form = useZodForm(resetPasswordSchema, { confirmPassword: '', password: '' });
  const setFormError = buildFormErrorSetter(form);
  const handleAuthResult = buildResetResultHandler(navigate, show, setFormError, auth.signOut);
  const handleAuthFailure = buildAuthFailureHandler(setFormError, RESET_MESSAGES.networkError);

  function onSubmit(values: ResetPasswordValues): Promise<void> {
    return auth.updatePassword(values.password).then(handleAuthResult, handleAuthFailure);
  }

  return {
    control: form.control,
    formError: readFormError(form),
    handleSubmit: form.handleSubmit(onSubmit),
    isSubmitting: form.formState.isSubmitting,
  };
}
