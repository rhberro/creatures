import type { ReactElement } from 'react';

import { Button } from '~/components/base/button/Button';
import { AuthActions } from '~/components/domain/auth/AuthActions';
import { AuthField } from '~/components/domain/auth/AuthField';
import { AuthForm } from '~/components/domain/auth/AuthForm';
import { AuthShell } from '~/components/domain/auth/AuthShell';

export function ResetPasswordScreen(): ReactElement {
  return (
    <AuthShell title="Nova Senha">
      <AuthForm>
        <AuthField
          autoComplete="new-password"
          label="Nova senha"
          name="password"
          placeholder="Sua nova senha"
          type="password"
        />
        <AuthField
          autoComplete="new-password"
          label="Confirmar senha"
          name="password-confirm"
          placeholder="Repita a senha"
          type="password"
        />
      </AuthForm>
      <AuthActions>
        <Button tone="primary">Redefinir</Button>
      </AuthActions>
    </AuthShell>
  );
}
