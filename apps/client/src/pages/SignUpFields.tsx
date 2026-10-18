import { Input } from '@chakra-ui/react';
import type { ChangeEvent, ReactElement } from 'react';

export function SignUpFields(props: SignUpFieldsProps): ReactElement {
  const {
    confirmPassword,
    email,
    onConfirmPasswordChange,
    onEmailChange,
    onPasswordChange,
    password,
  } = props;
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
        autoComplete="new-password"
        name="password"
        onChange={onPasswordChange}
        placeholder="Senha"
        type="password"
        value={password}
      />
      <Input
        autoComplete="new-password"
        name="confirmPassword"
        onChange={onConfirmPasswordChange}
        placeholder="Confirmar senha"
        type="password"
        value={confirmPassword}
      />
    </>
  );
}

export type SignUpFieldsProps = {
  confirmPassword: string;
  email: string;
  onConfirmPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onEmailChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
  password: string;
};
