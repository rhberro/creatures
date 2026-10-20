import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Text } from '~/components/base/text/Text';

export function ReconnectScreen(): ReactElement {
  return (
    <Box
      alignItems="center"
      bg="bg"
      display="flex"
      flexDirection="column"
      height="320px"
      justifyContent="center"
      width="520px"
    >
      <Box
        alignItems="center"
        borderColor="arcane.500"
        borderRadius="full"
        borderStyle="solid"
        borderTopColor="transparent"
        borderWidth="2px"
        height="34px"
        mb="5"
        width="34px"
      />
      <Text color="fg" marginBlockEnd="2" variant="title">
        Conexão perdida
      </Text>
      <Text color="fg.muted" maxW="42ch" textAlign="center" variant="body">
        A conexão com o servidor foi perdida. Tentando reconectar.
      </Text>
      <Text color="fg.subtle" marginBlockStart="4" variant="numeric">
        Tentativa 3
      </Text>
    </Box>
  );
}
