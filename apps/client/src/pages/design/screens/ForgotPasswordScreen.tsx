import type { ReactElement } from 'react';

import { Button } from '~/components/base/button/Button';
import { Text } from '~/components/base/text/Text';
import { AuthActions } from '~/components/domain/auth/AuthActions';
import { AuthField } from '~/components/domain/auth/AuthField';
import { AuthShell } from '~/components/domain/auth/AuthShell';

export function ForgotPasswordScreen(): ReactElement {
  return (
    <AuthShell title="Recuperar Senha">
      <Text color="fg.muted" variant="body">
        Se o e-mail existir em nossa base, enviamos um link de recuperação.
      </Text>
      <AuthField
        autoComplete="email"
        label="E-mail"
        name="email"
        placeholder="treinador@exemplo.com"
        type="email"
      />
      <AuthActions>
        <Button tone="primary">Enviar link</Button>
        <Button tone="secondary">Voltar</Button>
      </AuthActions>
    </AuthShell>
  );
}
