import type { ReactElement } from 'react';

import { LegalNotice } from '~/features/authentication';
import { BrandPage } from '~/shared/ui/brand';

import { SignInForm } from './SignInForm';

export function SignInPage(): ReactElement {
  return (
    <BrandPage footer=<LegalNotice action="Ao continuar" /> title="Entrar no Jogo">
      <SignInForm />
    </BrandPage>
  );
}
