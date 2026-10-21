import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Frame } from '~/shared/ui/frame';
import type { SkillBarProps } from '~/widgets/game-hud/model/skillBar.types';

import { SkillSlots } from './SkillSlots';
import { Vitals } from './Vitals';

export function SkillBar(props: SkillBarProps): ReactElement {
  const {
    children,
    equippedAbilities,
    equippedConsumables,
    equippedDevice,
    onSlotPress,
    openSlot = null,
    stamina,
    vitals,
  } = props;
  return (
    <Box bottom={4} left="50%" position="absolute" transform="translateX(-50%)">
      {children}
      <Frame tone="panel">
        <Box alignItems="center" display="flex" gap={4} padding={2}>
          <SkillSlots
            abilities={equippedAbilities}
            consumables={equippedConsumables}
            device={equippedDevice}
            onSlotPress={onSlotPress}
            openSlot={openSlot}
          />
          <Box bg="border" height="56px" width="1px" />
          <Vitals stamina={stamina} vitals={vitals} />
        </Box>
      </Frame>
    </Box>
  );
}
