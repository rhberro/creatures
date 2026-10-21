import type { ReactElement } from 'react';

import { FormShell } from '~/shared/ui/form';

import { LegalNote } from './legal/LegalNote';

export function TermsScreen(): ReactElement {
  return (
    <FormShell title="Termos de Serviço">
      <LegalNote label="Termos" />
    </FormShell>
  );
}
