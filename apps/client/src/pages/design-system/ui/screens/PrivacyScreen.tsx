import type { ReactElement } from 'react';

import { FormShell } from '~/shared/ui/form';

import { LegalNote } from './legal/LegalNote';

export function PrivacyScreen(): ReactElement {
  return (
    <FormShell title="Política de Privacidade">
      <LegalNote label="Privacidade" />
    </FormShell>
  );
}
