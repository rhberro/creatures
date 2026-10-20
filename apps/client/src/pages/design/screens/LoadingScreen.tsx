import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Text } from '~/components/base/text/Text';

export function LoadingScreen(): ReactElement {
  return (
    <Box
      alignItems="center"
      bg="bg.DEFAULT"
      display="flex"
      flexDirection="column"
      height="320px"
      justifyContent="center"
      width="520px"
    >
      <Text color="fg" variant="title">
        Creatures
      </Text>
      <Box
        borderColor="arcane.500"
        borderRadius="full"
        borderStyle="solid"
        borderTopColor="transparent"
        borderWidth="2px"
        height="28px"
        marginBlockStart="6"
        width="28px"
      />
      <Text color="fg.subtle" marginBlockStart="4" variant="meta">
        Carregando
      </Text>
    </Box>
  );
}
