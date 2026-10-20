import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Cooldown } from '~/components/base/frame/Cooldown';
import { Frame } from '~/components/base/frame/Frame';
import { Slot } from '~/components/base/frame/Slot';
import { IconBolt, IconHeart, IconPotion, IconPrism } from '~/components/base/icon';
import { Text } from '~/components/base/text/Text';

const COOLDOWN_TOTAL = 5000;
const COOLDOWN_REMAINING = 2500;
const HP_RATIO = 0.75;
const STAMINA_RATIO = 0.5;
const GLYPH_SIZE = '26px';

type SkillSlotCategory = 'consumable' | 'device' | 'skill';

const SLOT_TONES: Record<SkillSlotCategory, string[]> = {
  consumable: ['verdant.400', 'frost.400'],
  device: ['frost.400'],
  skill: ['ember.400', 'ember.400', 'base.300', 'base.300'],
};

export function SkillBar(): ReactElement {
  return (
    <Box bottom={4} left="50%" position="absolute" transform="translateX(-50%)">
      <Frame tone="panel">
        <Box alignItems="center" display="flex" gap={4} padding={2}>
          <SkillSlots />
          <Box bg="border" height="56px" width="1px" />
          <Vitals />
        </Box>
      </Frame>
    </Box>
  );
}

function SkillSlots(): ReactElement {
  return (
    <Box display="flex" gap={1}>
      <SkillSlot category="skill" index={0} />
      <SkillSlot category="skill" index={1} />
      <SkillSlot category="skill" index={2} />
      <SkillSlot category="skill" index={3} />
      <Box bg="border" height="56px" width="1px" />
      <SkillSlot category="consumable" index={0} />
      <SkillSlot category="consumable" index={1} />
      <Box bg="border" height="56px" width="1px" />
      <SkillSlot category="device" index={0} />
    </Box>
  );
}

function SkillSlot(props: SkillSlotProps): ReactElement {
  const { category, index } = props;
  const showCooldown = category === 'skill' && index === 0;
  const cooldownNode = renderCooldown(showCooldown);
  const tone = SLOT_TONES[category][index];
  const glyph = renderGlyph(category);
  return (
    <Slot>
      <Box
        alignItems="center"
        bg={tone}
        color="base.950"
        display="flex"
        height="100%"
        justifyContent="center"
        width="100%"
      >
        {glyph}
      </Box>
      {cooldownNode}
    </Slot>
  );
}

function renderGlyph(category: SkillSlotCategory): ReactElement {
  if (category === 'consumable') {
    return <IconPotion size={GLYPH_SIZE} />;
  }
  if (category === 'device') {
    return <IconPrism size={GLYPH_SIZE} />;
  }
  return <IconBolt size={GLYPH_SIZE} />;
}

function renderCooldown(visible: boolean): ReactElement | null {
  if (!visible) {
    return null;
  }
  return <Cooldown remaining={COOLDOWN_REMAINING} total={COOLDOWN_TOTAL} />;
}

type SkillSlotProps = {
  category: SkillSlotCategory;
  index: number;
};

function Vitals(): ReactElement {
  return (
    <Box minW="180px">
      <StatusBar color="hp" icon={<IconHeart />} label="Vida" ratio={HP_RATIO} />
      <StatusBar color="stamina" icon={<IconBolt />} label="Stamina" ratio={STAMINA_RATIO} />
    </Box>
  );
}

type StatusBarProps = {
  color: string;
  icon: ReactElement;
  label: string;
  ratio: number;
};

function StatusBar(props: StatusBarProps): ReactElement {
  const { color, icon, label, ratio } = props;
  const widthStyle = `${ratio * 100}%`;
  const percentLabel = `${Math.round(ratio * 100)}%`;
  return (
    <Box marginBlockEnd="1.5">
      <Box alignItems="center" display="flex" gap={1} mb={1}>
        <Box color={color} display="flex">
          {icon}
        </Box>
        <Text color="fg.muted" variant="meta">
          {label}
        </Text>
        <Text color="fg.muted" marginInlineStart="auto" variant="numeric">
          {percentLabel}
        </Text>
      </Box>
      <Box
        bg="bg.sunken"
        borderRadius="xs"
        boxShadow="recessed"
        h="8px"
        overflow="hidden"
        w="180px"
      >
        <Box bg={color} h="full" transition="width 180ms ease-out" width={widthStyle} />
      </Box>
    </Box>
  );
}
