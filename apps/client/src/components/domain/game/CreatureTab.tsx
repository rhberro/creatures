import { Box } from '@chakra-ui/react';
import type { SystemStyleObject } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Pressable } from '~/components/base/interactive/Pressable';
import { Text } from '~/components/base/text/Text';
import { useSelectionRing } from '~/theme/recipes/useSelectionRing';

import { CreaturePortrait } from './CreaturePortrait';
import type { Creature } from './game.types';

const TAB_WIDTH = '92px';

type CreatureTabProps = {
  creature: Creature;
  isActive: boolean;
  onSelect: (id: string) => void;
};

export function CreatureTab(props: CreatureTabProps): ReactElement {
  const { creature, isActive, onSelect } = props;
  const selectionRing = useSelectionRing();
  const ring = isActive ? selectionRing : undefined;
  const borderColor = isActive ? 'transparent' : 'border';
  const nameColor = isActive ? 'fg' : 'fg.muted';
  const portraitColor = isActive ? 'arcane.fg' : 'fg.subtle';

  function handleSelect(): void {
    onSelect(creature.id);
  }
  return (
    <Pressable onPress={handleSelect}>
      <CreatureTabBody
        borderColor={borderColor}
        creature={creature}
        nameColor={nameColor}
        portraitColor={portraitColor}
        ring={ring}
      />
    </Pressable>
  );
}

type CreatureTabBodyProps = {
  borderColor: string;
  creature: Creature;
  nameColor: string;
  portraitColor: string;
  ring: SystemStyleObject | undefined;
};

function CreatureTabBody(props: CreatureTabBodyProps): ReactElement {
  const { borderColor, creature, nameColor, portraitColor, ring } = props;
  return (
    <Box
      _before={ring}
      bg="bg.panel"
      borderColor={borderColor}
      borderRadius="sm"
      borderWidth="1px"
      boxShadow="raised"
      paddingBlock="2"
      paddingInline="1"
      position="relative"
      transitionProperty="border-color, box-shadow"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
      width={TAB_WIDTH}
    >
      <Box alignItems="center" display="flex" justifyContent="center">
        <CreaturePortrait
          borderColor={borderColor}
          level={creature.level}
          textColor={portraitColor}
        />
      </Box>
      <Text
        color={nameColor}
        marginBlockStart="1"
        overflow="hidden"
        textAlign="center"
        textOverflow="ellipsis"
        variant="label"
        whiteSpace="nowrap"
        width="full"
      >
        {creature.name}
      </Text>
    </Box>
  );
}
