import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import type { Area } from '~/pages/design-system/model/huntAreaData';
import { Text } from '~/shared/ui/text';

const IMAGE_HEIGHT = '180px';

type AreaHeaderProps = {
  area: Area;
};

export function AreaHeader(props: AreaHeaderProps): ReactElement {
  const { area } = props;
  const levelLabel = `Recomendado ${area.recommended} - Mínimo ${area.minimum}`;
  return (
    <Box position="relative">
      <Box bg={area.tone} height={IMAGE_HEIGHT} width="full" />
      <Box
        bg="base.950"
        bottom="0"
        height="auto"
        left="0"
        opacity={0.62}
        position="absolute"
        right="0"
      />
      <Box bottom="3" left="4" position="absolute">
        <Text color="fg" variant="title">
          {area.name}
        </Text>
        <Text color="fg.muted" variant="meta">
          {levelLabel}
        </Text>
      </Box>
    </Box>
  );
}
