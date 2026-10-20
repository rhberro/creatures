import type { ReactElement } from 'react';

import { Button } from '~/components/base/button/Button';
import { Link } from '~/components/base/link/Link';
import { AuthActions } from '~/components/domain/auth/AuthActions';
import { AuthDivider } from '~/components/domain/auth/AuthDivider';

const SIGNIN_PATH = '/signin';

export function SignUpActions(props: SignUpActionsProps): ReactElement {
  const { isSubmitting, onGoogleClick } = props;
  return (
    <AuthActions>
      <Button tone="primary" disabled={isSubmitting} type="submit">
        Criar Conta
      </Button>
      <Link disabled={isSubmitting} to={SIGNIN_PATH} tone="secondary">
        Voltar
      </Link>
      <AuthDivider />
      <Button tone="secondary" disabled={isSubmitting} onClick={onGoogleClick}>
        Registrar com Google
      </Button>
    </AuthActions>
  );
}

export type SignUpActionsProps = {
  isSubmitting: boolean;
  onGoogleClick: () => void;
};
