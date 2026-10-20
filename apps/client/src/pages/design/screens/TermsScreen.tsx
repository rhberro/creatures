import type { ReactElement } from 'react';

import { AuthShell } from '~/components/domain/auth/AuthShell';

import { LegalNote } from './legal/LegalNote';

export function TermsScreen(): ReactElement {
  return (
    <AuthShell title="Termos de Serviço">
      <LegalNote label="Termos" />
    </AuthShell>
  );
}
