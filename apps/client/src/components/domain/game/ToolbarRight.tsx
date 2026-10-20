import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { IconButton } from '~/components/base/button/IconButton';
import { IconLogout } from '~/components/base/icon';

import { CurrencyBadge } from './CurrencyBadge';

type ToolbarRightProps = {
  diamonds: number;
  gold: number;
  onSignOut: () => void;
};

export function ToolbarRight(props: ToolbarRightProps): ReactElement {
  const { diamonds, gold, onSignOut } = props;
  return (
    <Box alignItems="center" display="flex" gap="3">
      <Box alignItems="center" display="flex" gap="2">
        <CurrencyBadge amount={diamonds} label="diamond" />
        <CurrencyBadge amount={gold} label="gold" />
      </Box>
      <Box alignItems="center" display="flex" gap="1">
        <IconButton label="Sair" onClick={onSignOut} tone="danger">
          <IconLogout size="20px" />
        </IconButton>
      </Box>
    </Box>
  );
}
