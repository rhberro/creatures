import { Box, HStack, Stack, Text } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Layer } from '~/components/layers/Layer';
import { LayerCloseButton } from '~/components/layers/LayerCloseButton';
import { ScrollArea } from '~/components/scroll/ScrollArea';

const BACKPACK_ITEMS: BackpackItem[] = [
  { id: 'i1', name: 'Poção de Cura Pequena', quantity: 5 },
  { id: 'i2', name: 'Poção de Cura Média', quantity: 2 },
  { id: 'i3', name: 'Éter', quantity: 1 },
  { id: 'i4', name: 'Reviver', quantity: 3 },
  { id: 'i5', name: 'Bolinho de Arroz', quantity: 10 },
  { id: 'i6', name: 'Semente', quantity: 7 },
  { id: 'i7', name: 'Carvão', quantity: 12 },
  { id: 'i8', name: 'Pedra de Evolução', quantity: 1 },
  { id: 'i9', name: 'Carta', quantity: 4 },
  { id: 'i10', name: 'Mapa', quantity: 1 },
];

const MODAL_HEIGHT = 'md';
const MODAL_WIDTH = 'lg';

export function BackpackModal(props: BackpackModalProps): ReactElement | null {
  const { isOpen, onClose } = props;
  if (!isOpen) {
    return null;
  }
  const itemElements = BACKPACK_ITEMS.map(renderBackpackItem);
  return (
    <Layer mode="composed" onClose={onClose}>
      <Box
        bg="bg.panel"
        borderColor="border.default"
        borderRadius="md"
        borderWidth="1px"
        h={MODAL_HEIGHT}
        position="relative"
        w={MODAL_WIDTH}
      >
        <LayerCloseButton onClose={onClose} />
        <Stack p={6}>
          <Text color="fg" fontSize="lg" fontWeight="bold">
            Mochila
          </Text>
          <ScrollArea h="sm">
            <Stack gap={2}>{itemElements}</Stack>
          </ScrollArea>
        </Stack>
      </Box>
    </Layer>
  );
}

function renderBackpackItem(item: BackpackItem): ReactElement {
  return (
    <HStack
      bg="bg.muted"
      borderColor="border.default"
      borderRadius="sm"
      borderWidth="1px"
      justifyContent="space-between"
      key={item.id}
      p={2}
    >
      <Text color="fg">{item.name}</Text>
      <Text color="fg.muted">x{item.quantity}</Text>
    </HStack>
  );
}

export type BackpackModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type BackpackItem = {
  id: string;
  name: string;
  quantity: number;
};
