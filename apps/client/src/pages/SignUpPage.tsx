import type { ReactElement } from 'react';

import { AuthPage } from '~/components/domain/auth/AuthPage';
import { SignUpFooter } from '~/pages/SignUpFooter';
import { SignUpForm } from '~/pages/SignUpForm';

export function SignUpPage(): ReactElement {
  return (
    <AuthPage footer=<SignUpFooter /> title="Criar Conta">
      <SignUpForm />
    </AuthPage>
  );
}
