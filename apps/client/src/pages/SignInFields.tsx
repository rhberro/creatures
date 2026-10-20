import { Box } from '@chakra-ui/react';
import type { ChangeEvent, ReactElement } from 'react';

import { Link } from '~/components/base/link/Link';
import { AuthField } from '~/components/domain/auth/AuthField';

const FORGOT_PASSWORD_PATH = '/forgot-password';

export function SignInFields(props: SignInFieldsProps): ReactElement {
  const { email, onEmailChange, onPasswordChange, password } = props;
  return (
    <>
      <AuthField
        autoComplete="email"
        label="E-mail"
        name="email"
        onChange={onEmailChange}
        placeholder="treinador@exemplo.com"
        type="email"
        value={email}
      />
      <AuthField
        autoComplete="current-password"
        label="Senha"
        name="password"
        onChange={onPasswordChange}
        placeholder="Sua senha"
        type="password"
        value={password}
      />
      <Box display="flex" justifyContent="flex-end">
        <Link to={FORGOT_PASSWORD_PATH} variant="label">
          Esqueci a senha
        </Link>
      </Box>
    </>
  );
}

export type SignInFieldsProps = {
  email: string;
  onEmailChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
  password: string;
};
