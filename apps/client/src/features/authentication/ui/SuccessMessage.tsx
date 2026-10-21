import type { ReactElement } from 'react';

import { RESET_MESSAGES } from '~/features/authentication/model/auth.messages';
import { Text } from '~/shared/ui/text';

export function SuccessMessage(): ReactElement {
  return <Text color="fg">{RESET_MESSAGES.successMessage}</Text>;
}
