import type { ChangeEvent, ReactElement } from 'react';

import { AuthField } from '~/components/domain/auth/AuthField';

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
        autoComplete="new-password"
        label="Senha"
        name="password"
        onChange={onPasswordChange}
        placeholder="Sua senha"
        type="password"
        value={password}
      />
      <AuthField
        autoComplete="new-password"
        label="Confirmar senha"
        name="confirmPassword"
        onChange={onConfirmPasswordChange}
        placeholder="Repita a senha"
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
