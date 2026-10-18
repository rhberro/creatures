import { Text } from '@chakra-ui/react';
import type { ReactElement } from 'react';

export function SignInError(props: SignInErrorProps): ReactElement | null {
  const { message } = props;
  if (message === '') {
    return null;
  }
  return (
    <Text color="fg.error" fontSize="sm" role="alert">
      {message}
    </Text>
  );
}

export type SignInErrorProps = {
  message: string;
};
