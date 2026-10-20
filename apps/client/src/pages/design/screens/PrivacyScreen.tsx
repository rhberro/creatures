import type { ReactElement } from 'react';

import { AuthShell } from '~/components/domain/auth/AuthShell';

import { LegalNote } from './legal/LegalNote';

export function PrivacyScreen(): ReactElement {
  return (
    <AuthShell title="Política de Privacidade">
      <LegalNote label="Privacidade" />
    </AuthShell>
  );
}
