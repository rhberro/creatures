import { Box } from '@chakra-ui/react';
import type { ItemCategory } from '@creatures/contracts/inventory';
import type { ReactElement } from 'react';

import { StoreCoins } from '~/features/store/ui/StoreCoins';
import { StoreGlyph } from '~/features/store/ui/StoreGlyph';
import { NativeButton } from '~/shared/ui/button';
import { Slot } from '~/shared/ui/frame';
import { Popup } from '~/shared/ui/popup';
import { Text } from '~/shared/ui/text';

const SLOT_WIDTH = '56px';

export type StoreSlotProps = {
  category: ItemCategory;
  isSelected?: boolean;
  name: string;
  onSelect?: () => void;
  /** The quantity of the stack, when the slot shows one. */
  quantity?: number;
  /** The value of the item, in gold coins. */
  value: number;
  /** The label of the value in the popup. */
  valueLabel: string;
};

/**
 * The slot of an item of the store.
 *
 * The popup shows the name of the item and what it is worth: the value of the
 * buy in the buy tab, the value of the sale in the sell tab.
 */
export function StoreSlot(props: StoreSlotProps): ReactElement {
  const { category, isSelected = false, name, onSelect, quantity, value, valueLabel } = props;
  const content = buildPopupContent(name, valueLabel, value);
  const badge = buildQuantityBadge(quantity);
  const label = buildSlotLabel(name, quantity);
  const trigger = (
    <NativeButton
      aria-label={label}
      display="block"
      onClick={onSelect}
      position="relative"
      width={SLOT_WIDTH}
    >
      <Slot selected={isSelected}>
        <StoreGlyph category={category} />
      </Slot>
      {badge}
    </NativeButton>
  );
  return <Popup content={content}>{trigger}</Popup>;
}

/**
 * The popup of an item: its name and what it is worth.
 */
function buildPopupContent(name: string, valueLabel: string, value: number): ReactElement {
  const title = <Text variant="name">{name}</Text>;
  const label = (
    <Text color="fg.muted" variant="meta">
      {valueLabel}
    </Text>
  );
  const coins = <StoreCoins value={value} />;
  return (
    <Box display="flex" flexDirection="column" gap="1">
      {title}
      {label}
      {coins}
    </Box>
  );
}

/**
 * The quantity of the stack, in the corner of the slot.
 */
function buildQuantityBadge(quantity: number | undefined): ReactElement | null {
  if (quantity === undefined) {
    return null;
  }
  const amount = (
    <Text color="fg" variant="numeric">
      {quantity}
    </Text>
  );
  return (
    <Box
      alignItems="center"
      bg="bg.sunken"
      borderRadius="sm"
      bottom="1"
      display="flex"
      justifyContent="center"
      minW="20px"
      paddingBlock="0.5"
      paddingInline="1"
      position="absolute"
      right="1"
    >
      {amount}
    </Box>
  );
}

function buildSlotLabel(name: string, quantity: number | undefined): string {
  if (quantity === undefined) {
    return name;
  }
  return `${name} (${quantity})`;
}
