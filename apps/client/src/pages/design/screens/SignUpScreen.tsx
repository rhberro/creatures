import type { ReactElement } from 'react';

import { Button } from '~/components/base/button/Button';
import { AuthActions } from '~/components/domain/auth/AuthActions';
import { AuthField } from '~/components/domain/auth/AuthField';
import { AuthForm } from '~/components/domain/auth/AuthForm';
import { AuthShell } from '~/components/domain/auth/AuthShell';

import { TermsNote } from './legal/TermsNote';

export function SignUpScreen(): ReactElement {
  return (
    <AuthShell footer=<TermsNote /> title="Criar Conta">
      <AuthField label="Nome" name="name" placeholder="Como você quer ser chamado" />
      <AuthField
        autoComplete="email"
        label="E-mail"
        name="email"
        placeholder="treinador@exemplo.com"
        type="email"
      />
      <AuthForm>
        <AuthField
          autoComplete="new-password"
          label="Senha"
          name="password"
          placeholder="Sua senha"
          type="password"
        />
      </AuthForm>
      <AuthActions>
        <Button tone="primary">Criar Conta</Button>
        <Button tone="secondary">Voltar</Button>
      </AuthActions>
    </AuthShell>
  );
}
