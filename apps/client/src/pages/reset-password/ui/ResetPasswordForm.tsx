import { Stack } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { usePasswordResetForm } from '~/pages/reset-password/model/usePasswordResetForm';
import { Button } from '~/shared/ui/button';
import { FormError, FormField } from '~/shared/ui/form';
import { Link } from '~/shared/ui/link';

const FORGOT_PASSWORD_PATH = '/forgot-password';
const FORM_LABEL = 'Redefinir senha';

export function ResetPasswordForm(): ReactElement {
  const form = usePasswordResetForm();

  return (
    <form aria-label={FORM_LABEL} noValidate onSubmit={form.handleSubmit}>
      <Stack gap={4}>
        <FormField
          autoComplete="new-password"
          control={form.control}
          label="Nova senha"
          name="password"
          placeholder="Sua nova senha"
          type="password"
        />
        <FormField
          autoComplete="new-password"
          control={form.control}
          label="Confirmar senha"
          name="confirmPassword"
          placeholder="Repita a senha"
          type="password"
        />
        <FormError message={form.formError} />
        <Button
          tone="primary"
          disabled={form.isSubmitting}
          loading={form.isSubmitting}
          type="submit"
        >
          Redefinir senha
        </Button>
        <Link to={FORGOT_PASSWORD_PATH} tone="secondary" width="full">
          Voltar
        </Link>
      </Stack>
    </form>
  );
}
