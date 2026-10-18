import type { ReactElement } from 'react';

import { PlaceholderPage } from '~/pages/PlaceholderPage';

const BACK_TO = '/signin';
const TITLE = 'Política de Privacidade';

export function PrivacyPage(): ReactElement {
  return <PlaceholderPage backTo={BACK_TO} title={TITLE} />;
}
