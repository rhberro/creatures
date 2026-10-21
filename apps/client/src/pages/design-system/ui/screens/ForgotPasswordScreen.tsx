import type { ReactElement } from 'react';

import { useStaticForm } from '~/pages/design-system/model/useStaticForm';
import { Button } from '~/shared/ui/button';
import { FormActions, FormField, FormShell } from '~/shared/ui/form';
import { Text } from '~/shared/ui/text';

export function ForgotPasswordScreen(): ReactElement {
  const control = useStaticForm();
  return (
    <FormShell title="Recuperar Senha">
      <Text color="fg.muted" variant="body">
        Se o e-mail existir em nossa base, enviamos um link de recuperação.
      </Text>
      <FormField
        autoComplete="email"
        control={control}
        label="E-mail"
        name="email"
        placeholder="treinador@exemplo.com"
        type="email"
      />
      <FormActions>
        <Button tone="primary">Enviar link</Button>
        <Button tone="secondary">Voltar</Button>
      </FormActions>
    </FormShell>
  );
}
