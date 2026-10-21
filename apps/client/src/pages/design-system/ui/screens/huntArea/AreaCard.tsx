import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import type { Area } from '~/pages/design-system/model/huntAreaData';
import { DIVIDER_BOTTOM } from '~/shared/theme';
import { Pressable } from '~/shared/ui/interactive';
import { Text } from '~/shared/ui/text';

import { CreatureCircles } from './CreatureCircles';

const PORTRAIT_SIZE = '84px';

type AreaCardProps = {
  area: Area;
  onSelect: (name: string) => void;
};

export function AreaCard(props: AreaCardProps): ReactElement {
  const { area, onSelect } = props;
  const levelLabel = `Recomendado ${area.recommended} - Mínimo ${area.minimum}`;

  function handleSelect(): void {
    onSelect(area.name);
  }

  return (
    <Pressable onPress={handleSelect}>
      <Box
        bg="bg.raised"
        borderColor="border"
        borderRadius="sm"
        borderWidth="1px"
        overflow="hidden"
      >
        <Box css={DIVIDER_BOTTOM} paddingBlock="2" textAlign="center">
          <Text color="fg" variant="name">
            {area.name}
          </Text>
        </Box>
        <Box alignItems="center" display="flex" flexDirection="column" gap="3" padding="3">
          <Box
            bg={area.tone}
            borderRadius="full"
            boxShadow="recessed"
            height={PORTRAIT_SIZE}
            width={PORTRAIT_SIZE}
          />
          <CreatureCircles creatures={area.creatures} />
          <Text color="fg.subtle" variant="meta">
            {levelLabel}
          </Text>
        </Box>
      </Box>
    </Pressable>
  );
}
