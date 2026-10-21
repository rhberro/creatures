import type { ReactElement } from 'react';

import { BrandPage } from '~/shared/ui/brand';

import { ForgotPasswordForm } from './ForgotPasswordForm';

export function ForgotPasswordPage(): ReactElement {
  return (
    <BrandPage title="Recuperar Senha">
      <ForgotPasswordForm />
    </BrandPage>
  );
}
