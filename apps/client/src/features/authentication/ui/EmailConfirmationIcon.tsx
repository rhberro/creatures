import type { ReactElement } from 'react';

import { IconBadge } from '~/shared/ui/badge';

const CONFIRMATION_ICON_LABEL = '✉';

export function EmailConfirmationIcon(): ReactElement {
  return <IconBadge>{CONFIRMATION_ICON_LABEL}</IconBadge>;
}
