import { Box, HStack, Stack, Text } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Popup } from '~/components/popup/Popup';
import { ACTIVE_CREATURE_INDEX, TEAM_SLOTS } from '~/pages/play/data';
import type { Creature } from '~/pages/play/types';

export function TeamStrip(): ReactElement {
  const slotElements = TEAM_SLOTS.map(renderCreatureSlot);
  return (
    <HStack gap={2} justifyContent="center" position="absolute" top="4" width="full">
      {slotElements}
    </HStack>
  );
}

function renderCreatureSlot(slot: Creature | null, index: number): ReactElement {
  if (slot === null) {
    return renderEmptySlot(index);
  }
  return renderFilledSlot(slot, index);
}

function renderEmptySlot(index: number): ReactElement {
  const key = buildEmptyKey(index);
  return <EmptySlot key={key} />;
}

function renderFilledSlot(creature: Creature, index: number): ReactElement {
  return <CreatureSlot key={creature.id} creature={creature} index={index} />;
}

function buildEmptyKey(index: number): string {
  return `empty-${index}`;
}

function CreatureSlot(props: CreatureSlotProps): ReactElement {
  const { creature, index } = props;
  const isActive = index === ACTIVE_CREATURE_INDEX;
  const popupContent = <CreaturePopupContent creature={creature} />;
  const borderColor = isActive ? 'state.selected' : 'border.default';
  const opacity = isActive ? 1 : 0.7;
  return (
    <Popup content={popupContent}>
      <Stack
        alignItems="center"
        borderColor={borderColor}
        borderRadius="md"
        borderWidth="2px"
        gap={0}
        opacity={opacity}
        p={2}
        position="relative"
      >
        <Box
          alignItems="center"
          bg="bg.muted"
          borderColor="border.default"
          borderRadius="full"
          borderWidth="1px"
          color="fg"
          display="flex"
          fontSize="xs"
          h="10"
          justifyContent="center"
          w="10"
        >
          {creature.level}
        </Box>
        <Text color="fg" fontSize="xs">
          {creature.name}
        </Text>
      </Stack>
    </Popup>
  );
}

function EmptySlot(): ReactElement {
  return (
    <Box
      alignItems="center"
      bg="bg.muted"
      borderColor="border.default"
      borderRadius="md"
      borderStyle="dashed"
      borderWidth="1px"
      color="fg.muted"
      display="flex"
      fontSize="xs"
      h="16"
      justifyContent="center"
      w="12"
    >
      Vazio
    </Box>
  );
}

function CreaturePopupContent(props: CreaturePopupContentProps): ReactElement {
  const { creature } = props;
  return (
    <Box
      bg="bg.panel"
      borderColor="border.default"
      borderRadius="md"
      borderWidth="1px"
      maxW="xs"
      p={3}
    >
      <Text color="fg" fontWeight="bold">
        {creature.name}
      </Text>
      <Text color="fg.muted" fontSize="sm">
        Level {creature.level}
      </Text>
    </Box>
  );
}

type CreatureSlotProps = {
  creature: Creature;
  index: number;
};

type CreaturePopupContentProps = {
  creature: Creature;
};
