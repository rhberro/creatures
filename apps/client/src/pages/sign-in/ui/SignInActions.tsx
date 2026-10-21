import type { ReactElement } from 'react';

import { Button } from '~/shared/ui/button';
import { FormActions, FormDivider } from '~/shared/ui/form';
import { Link } from '~/shared/ui/link';

const SIGNUP_PATH = '/signup';

export function SignInActions(props: SignInActionsProps): ReactElement {
  const { isBusy, isOAuthPending, isSubmitting, onGoogleClick } = props;
  return (
    <FormActions>
      <Button tone="primary" disabled={isBusy} loading={isSubmitting} type="submit">
        Entrar
      </Button>
      <Link disabled={isBusy} to={SIGNUP_PATH} tone="secondary">
        Criar Conta
      </Link>
      <FormDivider />
      <Button tone="secondary" disabled={isBusy} loading={isOAuthPending} onClick={onGoogleClick}>
        Entrar com Google
      </Button>
    </FormActions>
  );
}

export type SignInActionsProps = {
  isBusy: boolean;
  isOAuthPending: boolean;
  isSubmitting: boolean;
  onGoogleClick: () => void;
};
