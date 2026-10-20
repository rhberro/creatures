import type { ReactElement, ReactNode } from 'react';

import { Text } from '~/components/base/text/Text';

type FieldLabelProps = {
  children: ReactNode;
};

export function FieldLabel(props: FieldLabelProps): ReactElement {
  const { children } = props;
  return (
    <Text color="fg.muted" marginBlockEnd="1" variant="meta">
      {children}
    </Text>
  );
}
