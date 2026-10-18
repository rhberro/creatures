import { Box, HStack } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { CooldownShadow } from '~/components/cooldown/CooldownShadow';

const COOLDOWN_TOTAL = 5000;
const COOLDOWN_REMAINING = 2500;
const HP_RATIO = 0.75;
const STAMINA_RATIO = 0.5;

export function SkillBar(): ReactElement {
  return (
    <Box bottom="4" left="50%" position="absolute" transform="translateX(-50%)">
      <SkillSlots />
      <StatusBars />
    </Box>
  );
}

function SkillSlots(): ReactElement {
  return (
    <HStack
      alignItems="center"
      bg="bg.panel"
      borderColor="border.default"
      borderRadius="md"
      borderWidth="1px"
      gap={1}
      p={2}
    >
      <SkillSlot category="skill" index={0} />
      <SkillSlot category="skill" index={1} />
      <SkillSlot category="skill" index={2} />
      <SkillSlot category="skill" index={3} />
      <SkillSlot category="consumable" index={0} />
      <SkillSlot category="consumable" index={1} />
      <SkillSlot category="device" index={0} />
    </HStack>
  );
}

type SkillSlotCategory = 'consumable' | 'device' | 'skill';

function SkillSlot(props: SkillSlotProps): ReactElement {
  const { category, index } = props;
  const showCooldown = category === 'skill' && index === 0;
  const cooldownNode = renderCooldown(showCooldown);
  return (
    <Box
      bg="bg.muted"
      borderColor="border.default"
      borderRadius="sm"
      borderWidth="1px"
      h="10"
      position="relative"
      w="10"
    >
      {cooldownNode}
    </Box>
  );
}

function renderCooldown(visible: boolean): ReactElement | null {
  if (!visible) {
    return null;
  }
  return <CooldownShadow remaining={COOLDOWN_REMAINING} total={COOLDOWN_TOTAL} />;
}

type SkillSlotProps = {
  category: SkillSlotCategory;
  index: number;
};

function StatusBars(): ReactElement {
  return (
    <HStack gap={2} mt={1}>
      <StatusBar color="status.hp" ratio={HP_RATIO} />
      <StatusBar color="status.stamina" ratio={STAMINA_RATIO} />
    </HStack>
  );
}

function StatusBar(props: StatusBarProps): ReactElement {
  const { color, ratio } = props;
  const widthStyle = `${ratio * 100}%`;
  return (
    <Box
      bg="bg.muted"
      borderColor="border.default"
      borderRadius="sm"
      borderWidth="1px"
      h="1.5"
      overflow="hidden"
      w="64"
    >
      <Box bg={color} h="full" width={widthStyle} />
    </Box>
  );
}

type StatusBarProps = {
  color: string;
  ratio: number;
};
