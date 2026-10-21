import type { ReactElement } from 'react';

import { LegalNotice } from '~/features/authentication';

export function SignInFooter(): ReactElement {
  return <LegalNotice action="Ao continuar" />;
}
