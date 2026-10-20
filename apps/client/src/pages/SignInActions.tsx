import type { ReactElement } from 'react';

import { Button } from '~/components/base/button/Button';
import { Link } from '~/components/base/link/Link';
import { AuthActions } from '~/components/domain/auth/AuthActions';
import { AuthDivider } from '~/components/domain/auth/AuthDivider';

const SIGNUP_PATH = '/signup';

export function SignInActions(props: SignInActionsProps): ReactElement {
  const { isSubmitting, onGoogleClick } = props;
  return (
    <AuthActions>
      <Button tone="primary" disabled={isSubmitting} type="submit">
        Entrar
      </Button>
      <Link disabled={isSubmitting} to={SIGNUP_PATH} tone="secondary">
        Criar Conta
      </Link>
      <AuthDivider />
      <Button tone="secondary" disabled={isSubmitting} onClick={onGoogleClick}>
        Entrar com Google
      </Button>
    </AuthActions>
  );
}

export type SignInActionsProps = {
  isSubmitting: boolean;
  onGoogleClick: () => void;
};
