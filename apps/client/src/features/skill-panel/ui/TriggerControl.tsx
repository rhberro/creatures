import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Text } from '~/shared/ui/text';

import { TriggerButton } from './TriggerButton';

const TRIGGER_STEP = 5;
const MIN_TRIGGER = 5;
const MAX_TRIGGER = 95;

type TriggerControlProps = {
  onChange: (percent: number) => void;
  percent: number;
};

/**
 * The life that triggers the consumable of the slot.
 *
 * The percentage is what the creature watches: below it, the consumable is
 * used. The control shows the number and lets the player move it.
 */
export function TriggerControl(props: TriggerControlProps): ReactElement {
  const { onChange, percent } = props;
  const percentage = `${percent}%`;
  const fillWidth = `${percent}%`;

  function decrease(): void {
    onChange(clamp(percent - TRIGGER_STEP));
  }

  function increase(): void {
    onChange(clamp(percent + TRIGGER_STEP));
  }

  return (
    <Box bg="bg.sunken" borderRadius="sm" boxShadow="recessed" padding="2">
      <Text color="fg.muted" variant="meta">
        Usar quando a vida for menor que
      </Text>
      <Box alignItems="center" display="flex" gap="2" marginBlockStart="1">
        <TriggerButton label="−" onPress={decrease} />
        <Text color="fg" minW="42px" textAlign="center" variant="numeric">
          {percentage}
        </Text>
        <TriggerButton label="+" onPress={increase} />
        <Box bg="border" flex="1" height="4px">
          <Box bg="accent.arcane" height="100%" width={fillWidth} />
        </Box>
      </Box>
    </Box>
  );
}

function clamp(percent: number): number {
  if (percent < MIN_TRIGGER) {
    return MIN_TRIGGER;
  }
  if (percent > MAX_TRIGGER) {
    return MAX_TRIGGER;
  }
  return percent;
}
