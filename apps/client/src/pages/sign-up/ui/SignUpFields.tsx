import type { ReactElement } from 'react';
import type { Control } from 'react-hook-form';

import type { SignUpValues } from '~/features/authentication';
import { FormField } from '~/shared/ui/form';

export function SignUpFields(props: SignUpFieldsProps): ReactElement {
  const { control } = props;
  return (
    <>
      <FormField
        autoComplete="email"
        control={control}
        label="E-mail"
        name="email"
        placeholder="treinador@exemplo.com"
        type="email"
      />
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
    </>
  );
}

export type SignUpFieldsProps = {
  control: Control<SignUpValues>;
};
