import type { ReactElement } from 'react';

import { Button } from '~/shared/ui/button';
import { FormActions, FormDivider } from '~/shared/ui/form';
import { Link } from '~/shared/ui/link';

const SIGNIN_PATH = '/signin';

export function SignUpActions(props: SignUpActionsProps): ReactElement {
  const { isBusy, isOAuthPending, isSubmitting, onGoogleClick } = props;
  return (
    <FormActions>
      <Button tone="primary" disabled={isBusy} loading={isSubmitting} type="submit">
        Criar Conta
      </Button>
      <Link disabled={isBusy} to={SIGNIN_PATH} tone="secondary">
        Voltar
      </Link>
      <FormDivider />
      <Button tone="secondary" disabled={isBusy} loading={isOAuthPending} onClick={onGoogleClick}>
        Registrar com Google
      </Button>
    </FormActions>
  );
}

export type SignUpActionsProps = {
  isBusy: boolean;
  isOAuthPending: boolean;
  isSubmitting: boolean;
  onGoogleClick: () => void;
};
