import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import type { CreatureSlot } from '~/widgets/game-hud/model/gameHud.types';

import { CreatureTab } from './CreatureTab';
import { EmptyCreatureTab } from './EmptyCreatureTab';

type TeamStripProps = {
  activeId: string | null;
  onSelect: (id: string) => void;
  slots: CreatureSlot[];
};

export function TeamStrip(props: TeamStripProps): ReactElement {
  const { activeId, onSelect, slots } = props;
  const tabs = slots.map(renderTab(activeId, onSelect));
  return (
    <Box
      display="flex"
      gap="1"
      justifyContent="center"
      left="0"
      position="absolute"
      right="0"
      top="3"
    >
      {tabs}
    </Box>
  );
}

function renderTab(
  activeId: string | null,
  onSelect: (id: string) => void,
): (slot: CreatureSlot, index: number) => ReactElement {
  return function render(slot: CreatureSlot, index: number): ReactElement {
    if (slot === null) {
      const emptyKey = `empty-${index}`;
      return <EmptyCreatureTab key={emptyKey} />;
    }
    const isActive = slot.id === activeId;
    return <CreatureTab key={slot.id} creature={slot} isActive={isActive} onSelect={onSelect} />;
  };
}
