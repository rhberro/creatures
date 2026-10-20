import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { IconButton } from '~/components/base/button/IconButton';
import { IconBell, IconGear, IconLogout, IconUsers } from '~/components/base/icon';

import { CurrencyBadge } from './CurrencyBadge';

type ToolbarRightProps = {
  diamonds: number;
  gold: number;
  onOpenSettings: () => void;
  onShowAlert: () => void;
  onSignOut: () => void;
};

export function ToolbarRight(props: ToolbarRightProps): ReactElement {
  const { diamonds, gold, onOpenSettings, onShowAlert, onSignOut } = props;
  return (
    <Box alignItems="center" display="flex" gap="3">
      <Box alignItems="center" display="flex" gap="2">
        <CurrencyBadge amount={diamonds} label="diamond" />
        <CurrencyBadge amount={gold} label="gold" />
      </Box>
      <Box alignItems="center" display="flex" gap="1">
        <IconButton label="Notificações" onClick={onShowAlert}>
          <IconBell size="20px" />
        </IconButton>
        <IconButton label="Social" onClick={onShowAlert}>
          <IconUsers size="20px" />
        </IconButton>
        <IconButton label="Configurações" onClick={onOpenSettings}>
          <IconGear size="20px" />
        </IconButton>
        <IconButton label="Sair" onClick={onSignOut} tone="danger">
          <IconLogout size="20px" />
        </IconButton>
      </Box>
    </Box>
  );
}
