import type { ReactElement } from 'react';

import { Text } from '~/components/base/text/Text';

type FieldErrorProps = {
  message: string;
};

export function FieldError(props: FieldErrorProps): ReactElement {
  const { message } = props;
  return (
    <Text color="fg.error" role="alert" variant="body">
      {message}
    </Text>
  );
}
