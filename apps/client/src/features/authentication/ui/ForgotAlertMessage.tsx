import type { ReactElement } from 'react';

import { Text } from '~/shared/ui/text';

const FORGOT_ALERT_MESSAGE =
  'Se o e-mail existir em nossa base de dados, enviamos um link de recuperação.';

export function ForgotAlertMessage(): ReactElement {
  return <Text color="fg">{FORGOT_ALERT_MESSAGE}</Text>;
}
