import type { ReactElement } from 'react';

import { AuthPage } from '~/components/domain/auth/AuthPage';
import { ForgotPasswordForm } from '~/pages/ForgotPasswordForm';

export function ForgotPasswordPage(): ReactElement {
  return (
    <AuthPage title="Recuperar Senha">
      <ForgotPasswordForm />
    </AuthPage>
  );
}
