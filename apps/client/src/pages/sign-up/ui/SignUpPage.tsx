import type { ReactElement } from 'react';

import { BrandPage } from '~/shared/ui/brand';

import { SignUpFooter } from './SignUpFooter';
import { SignUpForm } from './SignUpForm';

export function SignUpPage(): ReactElement {
  return (
    <BrandPage footer=<SignUpFooter /> title="Criar Conta">
      <SignUpForm />
    </BrandPage>
  );
}
