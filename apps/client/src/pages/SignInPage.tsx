import type { ReactElement } from 'react';

import { AuthPage } from '~/components/domain/auth/AuthPage';
import { SignInFooter } from '~/pages/SignInFooter';
import { SignInForm } from '~/pages/SignInForm';

export function SignInPage(): ReactElement {
  return (
    <AuthPage footer=<SignInFooter /> title="Entrar no Jogo">
      <SignInForm />
    </AuthPage>
  );
}
