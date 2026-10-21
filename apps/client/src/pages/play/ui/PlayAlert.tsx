import type { ReactElement } from 'react';

import { IconBadge } from '~/shared/ui/badge';
import { Text } from '~/shared/ui/text';

const ALERT_ICON = 'i';

type PlayAlertMessageProps = {
  message: string;
};

export function PlayAlertMessage(props: PlayAlertMessageProps): ReactElement {
  const { message } = props;
  return <Text color="fg">{message}</Text>;
}

export function PlayAlertIcon(): ReactElement {
  return <IconBadge>{ALERT_ICON}</IconBadge>;
}
