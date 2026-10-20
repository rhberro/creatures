import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Text } from '~/components/base/text/Text';

type WordmarkProps = {
  marginBlockEnd?: string;
};

export function Wordmark(props: WordmarkProps): ReactElement {
  const { marginBlockEnd = '8' } = props;
  return (
    <Box marginBlockEnd={marginBlockEnd} textAlign="center">
      <Text color="fg" variant="display">
        Creatures
      </Text>
      <Box bg="coin" height="2px" marginBlockStart="2" marginInline="auto" width="56px" />
    </Box>
  );
}
