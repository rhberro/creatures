import type { ReactElement } from 'react';

import { FieldError } from '~/components/domain/auth/FieldError';

export function SignInError(props: SignInErrorProps): ReactElement | null {
  const { message } = props;
  if (message === '') {
    return null;
  }
  return <FieldError message={message} />;
}

export type SignInErrorProps = {
  message: string;
};
