import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Button } from '~/components/base/button/Button';
import { Text } from '~/components/base/text/Text';
import { AuthActions } from '~/components/domain/auth/AuthActions';
import { AuthField } from '~/components/domain/auth/AuthField';
import { AuthForm } from '~/components/domain/auth/AuthForm';
import { AuthShell } from '~/components/domain/auth/AuthShell';

import { TermsNote } from './legal/TermsNote';

export function SignInScreen(): ReactElement {
  return (
    <AuthShell footer=<TermsNote /> title="Entrar no Jogo">
      <AuthField
        autoComplete="email"
        label="E-mail"
        name="email"
        placeholder="treinador@exemplo.com"
        type="email"
      />
      <AuthForm>
        <AuthField
          autoComplete="current-password"
          label="Senha"
          name="password"
          placeholder="Sua senha"
          type="password"
        />
      </AuthForm>
      <Box display="flex" justifyContent="flex-end">
        <Text color="arcane.300" variant="label">
          Esqueci a senha
        </Text>
      </Box>
      <AuthActions>
        <Button tone="primary">Entrar</Button>
        <Button tone="secondary">Criar Conta</Button>
      </AuthActions>
    </AuthShell>
  );
}
