import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { TextField } from '~/components/base/field/TextField';
import { Modal } from '~/components/base/modal/Modal';
import { ModalBody } from '~/components/base/modal/ModalBody';
import { ModalFooter } from '~/components/base/modal/ModalFooter';
import { ModalHeader } from '~/components/base/modal/ModalHeader';

import { AreaCard } from './AreaCard';
import { AREAS, AREA_PAGE_COUNT } from './data';
import { Pagination } from './Pagination';

const MODAL_WIDTH = '980px';
const MODAL_HEIGHT = '720px';

export function HuntAreaSelect(): ReactElement {
  const cards = AREAS.map(renderAreaCard);
  return (
    <Modal contained height={MODAL_HEIGHT} isOpen onClose={noop} width={MODAL_WIDTH}>
      <ModalHeader>Locais de Caça</ModalHeader>
      <ModalBody>
        <Box display="grid" gap="3" gridTemplateColumns="repeat(4, 1fr)">
          {cards}
        </Box>
      </ModalBody>
      <ModalFooter>
        <Box position="relative" width="full">
          <Box display="flex" justifyContent="center">
            <Pagination current={1} total={AREA_PAGE_COUNT} />
          </Box>
          <Box position="absolute" right="0" top="0">
            <TextField
              aria-label="Buscar locais ou criaturas"
              maxW="280px"
              name="buscar-area"
              placeholder="Buscar locais ou criaturas"
            />
          </Box>
        </Box>
      </ModalFooter>
    </Modal>
  );
}

function renderAreaCard(area: (typeof AREAS)[number]): ReactElement {
  return <AreaCard area={area} key={area.name} onSelect={noop} />;
}

function noop(): void {
  void 0;
}
