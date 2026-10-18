import type { ReactElement } from 'react';

import { PlaceholderPage } from '~/pages/PlaceholderPage';

const BACK_TO = '/signin';
const TITLE = 'Termos de Serviço';

export function TermsPage(): ReactElement {
  return <PlaceholderPage backTo={BACK_TO} title={TITLE} />;
}
