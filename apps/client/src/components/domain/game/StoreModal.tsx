import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Button } from '~/components/base/button/Button';
import { IconCoin } from '~/components/base/icon';
import { Modal } from '~/components/base/modal/Modal';
import { ModalBody } from '~/components/base/modal/ModalBody';
import { ModalFooter } from '~/components/base/modal/ModalFooter';
import { ModalHeader } from '~/components/base/modal/ModalHeader';
import { ScrollArea } from '~/components/base/scroll/ScrollArea';
import { Tab } from '~/components/base/tab/Tab';
import { TabBar } from '~/components/base/tab/TabBar';
import { Text } from '~/components/base/text/Text';

import { StoreSection, type StoreItem } from './StoreGrid';

const CONSUMABLES: StoreItem[] = [
  { glyph: '✚', name: 'Poção de Cura', price: 120, tone: 'arcane.500' },
  { glyph: '✦', name: 'Elixir de Stamina', price: 340, tone: 'frost.500' },
  { glyph: '✹', name: 'Frasco Antídoto', price: 260, tone: 'ember.500' },
  { glyph: '◈', name: 'Isca de Caça', price: 90, tone: 'gold.500' },
  { glyph: '❖', name: 'Bálsamo de Prata', price: 410, tone: 'base.500' },
];

const DEVICES: StoreItem[] = [
  { glyph: '⬢', name: 'Prisma de Captura', price: 1800, tone: 'frost.500' },
  { glyph: '⬣', name: 'Isca Prisma', price: 1200, tone: 'gold.500' },
  { glyph: '⬡', name: 'Cristal Bruto', price: 2400, tone: 'base.500' },
  { glyph: '✜', name: 'Frasco de Vidro', price: 1500, tone: 'verdant.500' },
  { glyph: '✥', name: 'Núcleo Vazio', price: 3200, tone: 'ember.500' },
];

const QUANTITY_STEPS: string[] = ['+10', '+100', '+1000'];
const TOTAL = '120';
const TITLE = 'Loja';
const BUY_LABEL = 'Comprar';
const SELL_LABEL = 'Vender';
const STORE_WIDTH = '720px';
const STORE_HEIGHT = '620px';

type StoreModalProps = {
  contained?: boolean;
  isOpen: boolean;
  onClose: () => void;
};

export function StoreModal(props: StoreModalProps): ReactElement | null {
  const { contained = false, isOpen, onClose } = props;
  if (!isOpen) {
    return null;
  }
  return (
    <Modal contained={contained} height={STORE_HEIGHT} onClose={onClose} width={STORE_WIDTH}>
      <ModalHeader>{TITLE}</ModalHeader>
      <Box borderBottom="1px solid" borderColor="border" paddingBlock="2" paddingInline="4">
        <TabBar>
          <Tab active>{BUY_LABEL}</Tab>
          <Tab>{SELL_LABEL}</Tab>
        </TabBar>
      </Box>
      <ModalBody>
        <ScrollArea height="full">
          <Box display="flex" flexDirection="column" gap="5">
            <StoreSection items={CONSUMABLES} title="Consumíveis" />
            <StoreSection items={DEVICES} title="Dispositivos" />
          </Box>
        </ScrollArea>
      </ModalBody>
      <ModalFooter>
        <StoreFooter />
      </ModalFooter>
    </Modal>
  );
}

function StoreFooter(): ReactElement {
  const quantityButtons = QUANTITY_STEPS.map(renderQuantityButton);
  return (
    <>
      <Box
        alignItems="center"
        bg="bg.sunken"
        borderRadius="sm"
        boxShadow="recessed"
        color="fg.subtle"
        display="flex"
        height="32px"
        justifyContent="center"
        width="48px"
      >
        <Text variant="numeric">1</Text>
      </Box>
      {quantityButtons}
      <Box alignItems="center" display="flex" gap="2" marginInlineStart="auto">
        <Box color="currency.gold" display="flex">
          <IconCoin />
        </Box>
        <Text color="currency.gold" variant="numeric">
          {TOTAL}
        </Text>
      </Box>
      <Button tone="primary">{BUY_LABEL}</Button>
    </>
  );
}

function renderQuantityButton(label: string): ReactElement {
  return (
    <Button key={label} size="sm" tone="secondary">
      {label}
    </Button>
  );
}
