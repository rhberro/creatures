import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Frame } from '~/components/base/frame/Frame';
import { FrameHeader } from '~/components/base/frame/FrameHeader';
import { Text } from '~/components/base/text/Text';

export function EmptyTrainers(): ReactElement {
  return (
    <Box width="380px">
      <Frame>
        <FrameHeader>Lista de Treinadores</FrameHeader>
        <Box padding="4">
          <Box
            alignItems="center"
            borderColor="border"
            borderRadius="sm"
            borderStyle="dashed"
            borderWidth="1px"
            color="fg.muted"
            cursor="pointer"
            display="flex"
            gap="3"
            padding="3"
          >
            <Text color="fg.subtle" variant="body">
              +
            </Text>
            <Text variant="label">Criar treinador</Text>
          </Box>
        </Box>
      </Frame>
    </Box>
  );
}
