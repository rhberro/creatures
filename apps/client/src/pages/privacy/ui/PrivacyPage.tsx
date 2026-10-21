import type { ReactElement } from 'react';

import { Placeholder } from '~/shared/ui/placeholder';

const BACK_TO = '/signin';
const TITLE = 'Política de Privacidade';

export function PrivacyPage(): ReactElement {
  return <Placeholder backTo={BACK_TO} title={TITLE} />;
}
