import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';
import type { Control } from 'react-hook-form';

import type { SignInValues } from '~/features/authentication';
import { FormField } from '~/shared/ui/form';
import { Link } from '~/shared/ui/link';

const FORGOT_PASSWORD_PATH = '/forgot-password';

export function SignInFields(props: SignInFieldsProps): ReactElement {
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
        autoComplete="current-password"
        control={control}
        label="Senha"
        name="password"
        placeholder="Sua senha"
        type="password"
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
  control: Control<SignInValues>;
};
