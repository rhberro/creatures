import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import type { ToolbarProps } from './toolbar.types';
import { ToolbarLeft } from './ToolbarLeft';
import { ToolbarRight } from './ToolbarRight';

const TOOLBAR_HEIGHT = '56px';

export function Toolbar(props: ToolbarProps): ReactElement {
  const { diamonds, gold, onOpenBackpack, onOpenStorage, onSignOut, trainerLevel, trainerName } =
    props;
  return (
    <Box
      alignItems="center"
      bg="bg.panel"
      borderBottomColor="border"
      borderBottomWidth="1px"
      boxShadow="raised"
      display="flex"
      height={TOOLBAR_HEIGHT}
      justifyContent="space-between"
      paddingInline="4"
    >
      <ToolbarLeft
        trainerLevel={trainerLevel}
        trainerName={trainerName}
        onOpenBackpack={onOpenBackpack}
        onOpenStorage={onOpenStorage}
      />
      <ToolbarRight diamonds={diamonds} gold={gold} onSignOut={onSignOut} />
    </Box>
  );
}
