import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { IconButton } from '~/components/base/button/IconButton';
import { IconBag, IconBell, IconChest } from '~/components/base/icon';

import { ToolbarIdentity } from './ToolbarIdentity';

type ToolbarLeftProps = {
  onOpenBackpack: () => void;
  onOpenStorage: () => void;
  onShowAlert: () => void;
  trainerLevel: number;
  trainerName: string;
};

export function ToolbarLeft(props: ToolbarLeftProps): ReactElement {
  const { onOpenBackpack, onOpenStorage, onShowAlert, trainerLevel, trainerName } = props;
  return (
    <Box alignItems="center" display="flex" gap="4">
      <ToolbarIdentity level={trainerLevel} name={trainerName} />
      <Box bg="border" height="28px" width="1px" />
      <Box alignItems="center" display="flex" gap="1">
        <IconButton label="Mochila" onClick={onOpenBackpack}>
          <IconBag size="20px" />
        </IconButton>
        <IconButton label="Armazenamento" onClick={onOpenStorage}>
          <IconChest size="20px" />
        </IconButton>
        <IconButton label="Alerta" onClick={onShowAlert}>
          <IconBell size="20px" />
        </IconButton>
      </Box>
    </Box>
  );
}
