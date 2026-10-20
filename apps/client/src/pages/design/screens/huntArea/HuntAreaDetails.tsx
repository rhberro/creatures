import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Button } from '~/components/base/button/Button';
import { Drawer } from '~/components/base/drawer/Drawer';
import { DrawerBody } from '~/components/base/drawer/DrawerBody';
import { DrawerFooter } from '~/components/base/drawer/DrawerFooter';

import { AreaHeader } from './AreaHeader';
import { CreatureGallery } from './CreatureGallery';
import { AREAS } from './data';

const DRAWER_WIDTH = '380px';
const DRAWER_HEIGHT = '720px';

export function HuntAreaDetails(): ReactElement {
  const area = AREAS[1];
  return (
    <Drawer contained height={DRAWER_HEIGHT} onClose={noop} width={DRAWER_WIDTH}>
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
