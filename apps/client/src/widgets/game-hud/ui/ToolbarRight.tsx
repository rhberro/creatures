import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { CurrencyBadge } from './CurrencyBadge';
import { SettingsMenu } from './SettingsMenu';

type ToolbarRightProps = {
  diamonds: number;
  gold: number;
  onSignOut: () => void;
  onSwitchTrainer: () => void;
};

export function ToolbarRight(props: ToolbarRightProps): ReactElement {
  const { diamonds, gold, onSignOut, onSwitchTrainer } = props;
  return (
    <Box alignItems="center" display="flex" gap="3">
      <Box alignItems="center" display="flex" gap="2">
        <CurrencyBadge amount={diamonds} label="diamond" />
        <CurrencyBadge amount={gold} label="gold" />
      </Box>
      <Box alignItems="center" display="flex" gap="1">
        <SettingsMenu onSignOut={onSignOut} onSwitchTrainer={onSwitchTrainer} />
      </Box>
    </Box>
  );
}
