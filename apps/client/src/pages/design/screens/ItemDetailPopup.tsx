import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { IconClose } from '~/components/base/icon';
import { Text } from '~/components/base/text/Text';

export function ItemDetailPopup(): ReactElement {
  return (
    <Box width="240px">
      <Box
        bg="bg.panel"
        borderColor="border.emphasized"
        borderRadius="sm"
        borderWidth="1px"
        boxShadow="overlay"
        padding="3"
      >
        <Text color="fg" variant="name">
          Prisma de Captura
        </Text>
        <Text color="fg.muted" marginBlockStart="2" variant="body">
          Dispositivo de captura. Multiplica a chance de captura da criatura selvagem.
        </Text>
        <Box
          alignItems="center"
          borderColor="border"
          borderRadius="sm"
          borderWidth="1px"
          color="fg.subtle"
          cursor="pointer"
          display="flex"
          gap="2"
          justifyContent="center"
          marginBlockStart="3"
          paddingBlock="1.5"
        >
          <Text variant="label">Fechar</Text>
          <IconClose />
        </Box>
      </Box>
    </Box>
  );
}
