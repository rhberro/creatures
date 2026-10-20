import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Frame } from '~/components/base/frame/Frame';
import { FrameFooter } from '~/components/base/frame/FrameFooter';
import { FrameHeader } from '~/components/base/frame/FrameHeader';
import { Text } from '~/components/base/text/Text';

export function EmptyBackpack(): ReactElement {
  return (
    <Box width="420px">
      <Frame>
        <FrameHeader>Mochila</FrameHeader>
        <Box alignItems="center" display="flex" flexDirection="column" padding="10">
          <Text color="fg.muted" variant="body">
            Nenhum item encontrado
          </Text>
          <Text color="arcane.300" marginBlockStart="2" variant="label">
            Buscar de novo
          </Text>
        </Box>
        <FrameFooter>
          <EmptyFooter />
        </FrameFooter>
      </Frame>
    </Box>
  );
}

function EmptyFooter(): ReactElement {
  return (
    <Box alignItems="center" display="flex" justifyContent="flex-end">
      <Text color="fg.subtle" variant="body">
        Buscar na mochila
      </Text>
    </Box>
  );
}
