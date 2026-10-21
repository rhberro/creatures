import type { ReactElement } from 'react';

import { Placeholder } from '~/shared/ui/placeholder';

const BACK_TO = '/signin';
const TITLE = 'Termos de Serviço';

export function TermsPage(): ReactElement {
  return <Placeholder backTo={BACK_TO} title={TITLE} />;
}
