import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { AREAS } from '~/pages/design-system/model/huntAreaData';
import { Button } from '~/shared/ui/button';
import { Drawer, DrawerBody, DrawerFooter } from '~/shared/ui/drawer';

import { AreaHeader } from './AreaHeader';
import { CreatureGallery } from './CreatureGallery';

const DRAWER_WIDTH = '380px';
const DRAWER_HEIGHT = '720px';

export function HuntAreaDetails(): ReactElement {
  const area = AREAS[1];
  return (
    <Drawer
      contained
      height={DRAWER_HEIGHT}
      isOpen
      label={area.name}
      onClose={noop}
      width={DRAWER_WIDTH}
    >
      <AreaHeader area={area} />
      <DrawerBody>
        <Box display="flex" flexDirection="column" gap="5">
          <CreatureGallery entries={area.creatures} title="Criaturas" />
          <CreatureGallery entries={area.items} item title="Itens" />
        </Box>
      </DrawerBody>
      <DrawerFooter>
        <Button tone="primary" width="full">
          Iniciar Caçada
        </Button>
      </DrawerFooter>
    </Drawer>
  );
}

function noop(): void {
  void 0;
}
