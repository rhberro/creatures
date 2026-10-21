import type { ReactElement } from 'react';

import { FORGOT_MESSAGES } from '~/features/authentication/model/auth.messages';
import { Text } from '~/shared/ui/text';

export function ForgotAlertMessage(): ReactElement {
  return <Text color="fg">{FORGOT_MESSAGES.alertMessage}</Text>;
}
