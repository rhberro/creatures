import type { ReactElement } from 'react';

import { Button } from '~/components/base/button/Button';
import { AuthActions } from '~/components/domain/auth/AuthActions';

const CREATE_LABEL = 'Criar';
const BACK_LABEL = 'Voltar';

type NewTrainerActionsProps = {
  isCreatable: boolean;
  isSubmitting: boolean;
  onBack: () => void;
};

export function NewTrainerActions(props: NewTrainerActionsProps): ReactElement {
  const { isCreatable, isSubmitting, onBack } = props;
  const isDisabled = !isCreatable;
  return (
    <AuthActions>
      <Button disabled={isDisabled} loading={isSubmitting} tone="primary" type="submit">
        {CREATE_LABEL}
      </Button>
      <Button onClick={onBack} tone="secondary">
        {BACK_LABEL}
      </Button>
    </AuthActions>
  );
}
