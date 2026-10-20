import type { ReactElement } from 'react';

import { IconBadge } from '~/components/base/badge/IconBadge';

const ALERT_ICON_LABEL = 'i';

export function ForgotAlertIcon(): ReactElement {
  return <IconBadge>{ALERT_ICON_LABEL}</IconBadge>;
}
