import type { ReactElement } from 'react';

import { Button } from '~/shared/ui/button';
import { FormActions } from '~/shared/ui/form';

const CREATE_LABEL = 'Criar';
const BACK_LABEL = 'Voltar';

type NewTrainerActionsProps = {
  isSubmitting: boolean;
  onBack: () => void;
};

export function NewTrainerActions(props: NewTrainerActionsProps): ReactElement {
  const { isSubmitting, onBack } = props;
  return (
    <FormActions>
      <Button disabled={isSubmitting} loading={isSubmitting} tone="primary" type="submit">
        {CREATE_LABEL}
      </Button>
      <Button disabled={isSubmitting} onClick={onBack} tone="secondary">
        {BACK_LABEL}
      </Button>
    </FormActions>
  );
}
