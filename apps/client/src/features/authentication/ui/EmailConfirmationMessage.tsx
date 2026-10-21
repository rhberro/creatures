import type { ReactElement } from 'react';

import { buildConfirmationRequiredMessage } from '~/features/authentication/model/auth.messages';
import { Text } from '~/shared/ui/text';

type EmailConfirmationMessageProps = {
  email: string;
};

export function EmailConfirmationMessage(props: EmailConfirmationMessageProps): ReactElement {
  const { email } = props;
  const message = buildConfirmationRequiredMessage(email);
  return <Text color="fg">{message}</Text>;
}
