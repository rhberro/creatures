import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import type { AreaEntry } from '~/pages/design-system/model/huntAreaData';
import { Text } from '~/shared/ui/text';

const CREATURE_SIZE = '48px';
const ITEM_SIZE = '32px';

type CreatureGalleryProps = {
  entries: AreaEntry[];
  item?: boolean;
  title: string;
};

export function CreatureGallery(props: CreatureGalleryProps): ReactElement {
  const { entries, item = false, title } = props;
  const size = item ? ITEM_SIZE : CREATURE_SIZE;
  const columns = item ? `repeat(8, ${size})` : `repeat(4, ${size})`;
  const cells = entries.map(renderCell(size));
  return (
    <Box>
      <Text color="fg" marginBlockEnd="2" variant="section">
        {title}
      </Text>
      <Box display="grid" gap="2" gridTemplateColumns={columns}>
        {cells}
      </Box>
    </Box>
  );
}

function renderCell(size: string): (entry: AreaEntry) => ReactElement {
  return function render(entry: AreaEntry): ReactElement {
    return (
      <Box
        bg={entry.tone}
        borderRadius="full"
        height={size}
        key={entry.name}
        title={entry.name}
        width={size}
      />
    );
  };
}
