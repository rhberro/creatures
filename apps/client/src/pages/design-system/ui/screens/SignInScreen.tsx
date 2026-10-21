import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { AuthUsernameField } from '~/features/authentication';
import { useStaticForm } from '~/pages/design-system/model/useStaticForm';
import { Button } from '~/shared/ui/button';
import { FormActions, FormField, FormShell } from '~/shared/ui/form';
import { Text } from '~/shared/ui/text';

import { TermsNote } from './legal/TermsNote';

export function SignInScreen(): ReactElement {
  const control = useStaticForm();
  return (
    <FormShell footer=<TermsNote /> title="Entrar no Jogo">
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
        autoComplete="current-password"
        control={control}
        label="Senha"
        name="password"
        placeholder="Sua senha"
        type="password"
      />
      <Box display="flex" justifyContent="flex-end">
        <Text color="arcane.300" variant="label">
          Esqueci a senha
        </Text>
      </Box>
      <FormActions>
        <Button tone="primary">Entrar</Button>
        <Button tone="secondary">Criar Conta</Button>
      </FormActions>
    </FormShell>
  );
}
