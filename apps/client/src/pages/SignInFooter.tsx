import type { ReactElement } from 'react';

import { LegalNotice } from '~/components/domain/auth/LegalNotice';

export function SignInFooter(): ReactElement {
  return <LegalNotice action="Ao continuar" />;
}
