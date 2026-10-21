import type { ReactElement } from 'react';

import { AuthUsernameField } from '~/features/authentication';
import { useStaticForm } from '~/pages/design-system/model/useStaticForm';
import { Button } from '~/shared/ui/button';
import { FormActions, FormField, FormShell } from '~/shared/ui/form';

import { TermsNote } from './legal/TermsNote';

export function SignUpScreen(): ReactElement {
  const control = useStaticForm();
  return (
    <FormShell footer=<TermsNote /> title="Criar Conta">
      <FormField
        autoComplete="email"
        control={control}
        label="E-mail"
        name="email"
        placeholder="treinador@exemplo.com"
        type="email"
      />
      <AuthUsernameField />
      <FormField
        autoComplete="new-password"
        control={control}
        label="Senha"
        name="password"
        placeholder="Sua senha"
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
        <Button tone="primary">Criar Conta</Button>
        <Button tone="secondary">Voltar</Button>
      </FormActions>
    </FormShell>
  );
}
