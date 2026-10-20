import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Slot } from '~/components/base/frame/Slot';
import { SlotGrid } from '~/components/base/frame/SlotGrid';
import { Text } from '~/components/base/text/Text';

export type StoreItem = {
  glyph: string;
  name: string;
  price: number;
  tone: string;
};

type StoreSectionProps = {
  items: StoreItem[];
  title: string;
};

export function StoreSection(props: StoreSectionProps): ReactElement {
  const { items, title } = props;
  const cells = items.map(renderStoreItem);
  return (
    <Box marginBlockEnd="4">
      <Text color="fg.muted" marginBlockEnd="2" variant="label">
        {title}
      </Text>
      <SlotGrid>{cells}</SlotGrid>
    </Box>
  );
}

function renderStoreItem(item: StoreItem): ReactElement {
  return (
    <Box key={item.name}>
      <Slot>
        <StoreGlyph glyph={item.glyph} tone={item.tone} />
      </Slot>
    </Box>
  );
}

type StoreGlyphProps = {
  glyph: string;
  tone: string;
};

function StoreGlyph(props: StoreGlyphProps): ReactElement {
  const { glyph, tone } = props;
  return (
    <Box
      alignItems="center"
      bg={tone}
      color="base.950"
      display="flex"
      fontSize="lg"
      height="100%"
      justifyContent="center"
      width="100%"
    >
      {glyph}
    </Box>
  );
}
