import type { ReactElement } from 'react';

import { BrandPage } from '~/shared/ui/brand';

import { SignInFooter } from './SignInFooter';
import { SignInForm } from './SignInForm';

export function SignInPage(): ReactElement {
  return (
    <BrandPage footer=<SignInFooter /> title="Entrar no Jogo">
      <SignInForm />
    </BrandPage>
  );
}
