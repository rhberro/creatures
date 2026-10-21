import type { ReactElement } from 'react';

import { AuthUsernameField } from '~/features/authentication';
import { useStaticForm } from '~/pages/design-system/model/useStaticForm';
import { Button } from '~/shared/ui/button';
import { FormActions, FormField, FormShell } from '~/shared/ui/form';

export function ResetPasswordScreen(): ReactElement {
  const control = useStaticForm();
  return (
    <FormShell title="Nova Senha">
      <AuthUsernameField />
      <FormField
        autoComplete="new-password"
        control={control}
        label="Nova senha"
        name="password"
        placeholder="Sua nova senha"
        type="password"
      />
      <FormField
        autoComplete="new-password"
        control={control}
        label="Confirmar senha"
        name="confirmPassword"
        placeholder="Repita a senha"
        type="password"
      />
      <FormActions>
        <Button tone="primary">Redefinir</Button>
      </FormActions>
    </FormShell>
  );
}
