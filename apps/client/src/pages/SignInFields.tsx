import { Box, Input } from '@chakra-ui/react';
import type { ChangeEvent, ReactElement } from 'react';
import { Link } from 'react-router-dom';

const FORGOT_PASSWORD_PATH = '/forgot-password';

export function SignInFields(props: SignInFieldsProps): ReactElement {
  const { email, onEmailChange, onPasswordChange, password } = props;
  return (
    <>
      <Input
        autoComplete="email"
        name="email"
        onChange={onEmailChange}
        placeholder="E-mail"
        type="email"
        value={email}
      />
      <Input
        autoComplete="current-password"
        name="password"
        onChange={onPasswordChange}
        placeholder="Senha"
        type="password"
        value={password}
      />
      <Box display="flex" justifyContent="flex-end">
        <Link to={FORGOT_PASSWORD_PATH}>Esqueci a senha</Link>
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
