import type { ReactElement } from 'react';

import { LegalNotice } from '~/components/domain/auth/LegalNotice';

export function SignUpFooter(): ReactElement {
  return <LegalNotice action="Ao criar a conta" />;
}
