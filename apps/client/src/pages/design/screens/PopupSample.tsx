import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { IconCoin } from '~/components/base/icon';
import { Text } from '~/components/base/text/Text';

export function PopupSample(): ReactElement {
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
          Poção de Cura
        </Text>
        <Box alignItems="center" color="currency.gold" display="flex" gap="1" marginBlockEnd="2">
          <IconCoin size="13px" />
          <Text variant="numeric">120</Text>
        </Box>
        <Text color="fg.muted" variant="body">
          Restaura 40 pontos de vida na criatura ativa.
        </Text>
      </Box>
    </Box>
  );
}
