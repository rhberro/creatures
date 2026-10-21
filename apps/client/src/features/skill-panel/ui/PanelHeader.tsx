import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Text } from '~/shared/ui/text';

type PanelHeaderProps = {
  subtitle: string;
  title: string;
};

export function PanelHeader(props: PanelHeaderProps): ReactElement {
  const { subtitle, title } = props;
  return (
    <Box borderBottom="1px solid" borderColor="border" padding="3">
      <Text color="fg" variant="section">
        {title}
      </Text>
      <Text color="fg.muted" marginBlockStart="1" variant="body">
        {subtitle}
      </Text>
    </Box>
  );
}
