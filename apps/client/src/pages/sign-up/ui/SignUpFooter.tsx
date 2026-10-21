import type { ReactElement } from 'react';

import { LegalNotice } from '~/features/authentication';

export function SignUpFooter(): ReactElement {
  return <LegalNotice action="Ao criar a conta" />;
}
