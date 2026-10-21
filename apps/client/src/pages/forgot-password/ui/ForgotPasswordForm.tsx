import { Stack } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { useForgotPasswordForm } from '~/pages/forgot-password/model/useForgotPasswordForm';
import { Button } from '~/shared/ui/button';
import { FormError, FormField } from '~/shared/ui/form';
import { Link } from '~/shared/ui/link';

const SIGNIN_PATH = '/signin';
const FORM_LABEL = 'Esqueci a senha';

export function ForgotPasswordForm(): ReactElement {
  const form = useForgotPasswordForm();

  return (
    <form aria-label={FORM_LABEL} noValidate onSubmit={form.handleSubmit}>
      <Stack gap={4}>
        <FormField
          autoComplete="email"
          control={form.control}
          label="E-mail"
          name="email"
          placeholder="treinador@exemplo.com"
          type="email"
        />
        <FormError message={form.formError} />
        <Button
          tone="primary"
          disabled={form.isSubmitting}
          loading={form.isSubmitting}
          type="submit"
        >
          Enviar
        </Button>
        <Link to={SIGNIN_PATH} tone="secondary" width="full">
          Voltar
        </Link>
      </Stack>
    </form>
  );
}
