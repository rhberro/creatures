import { Box } from '@chakra-ui/react';
import type { StoreItem } from '@creatures/contracts/store';
import type { ReactElement } from 'react';

import type { StoreView } from '~/features/store/model/store.types';
import { StoreSection } from '~/features/store/ui/StoreSection';
import { ScrollArea } from '~/shared/ui/scroll';

const CONSUMABLES_TITLE = 'Consumíveis';
const DEVICES_TITLE = 'Dispositivos';

/**
 * The buy tab: the catalog of the store, in two sections.
 */
export function StoreBuyPanel(props: { store: StoreView }): ReactElement {
  const { store } = props;
  const consumables = store.catalog.filter(function isConsumable(item: StoreItem): boolean {
    return item.category === 'consumable';
  });
  const devices = store.catalog.filter(function isDevice(item: StoreItem): boolean {
    return item.category === 'device';
  });
  const isSelected = buildIsSelected(store.selectedItemId);
  return (
    <ScrollArea height="full">
      <Box display="flex" flexDirection="column" gap="5">
        <StoreSection
          isSelected={isSelected}
          items={consumables}
          onSelect={store.select}
          title={CONSUMABLES_TITLE}
        />
        <StoreSection
          isSelected={isSelected}
          items={devices}
          onSelect={store.select}
          title={DEVICES_TITLE}
        />
      </Box>
    </ScrollArea>
  );
}

/**
 * The section of the catalog that holds the selected item.
 */
function buildIsSelected(selectedItemId: string | null): (itemId: string) => boolean {
  return function isSelected(itemId: string): boolean {
    return itemId === selectedItemId;
  };
}
