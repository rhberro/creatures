import type { ReactElement } from 'react';

import { IconBadge } from '~/shared/ui/badge';

const SUCCESS_ICON_LABEL = '✓';

export function SuccessIcon(): ReactElement {
  return <IconBadge>{SUCCESS_ICON_LABEL}</IconBadge>;
}
