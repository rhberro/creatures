import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import type { HuntAreaEntry } from '~/features/hunt-area/model/huntAreaEntries';
import { huntAreaToneFill } from '~/features/hunt-area/model/huntAreaTone';
import { PanelState } from '~/shared/ui/empty';
import { Popup } from '~/shared/ui/popup';
import { Text } from '~/shared/ui/text';

const CREATURE_SIZE = '48px';
const ITEM_SIZE = '32px';
const EMPTY_HEIGHT = '190px';

const CREATURES_EMPTY_TITLE = 'Nenhuma criatura encontrada';
const CREATURES_EMPTY_DESCRIPTION = 'Esta área não lista criaturas.';
const ITEMS_EMPTY_TITLE = 'Nenhum item encontrado';
const ITEMS_EMPTY_DESCRIPTION = 'Esta área não lista itens para coletar.';

type HuntAreaGalleryProps = {
  entries: HuntAreaEntry[];
  item?: boolean;
  title: string;
};

/**
 * A section of the drawer: the creatures of the area or the items it drops.
 *
 * The list has no cut: the drawer is where the player sees everything he will
 * find in the place. Every mark opens the popup with its name.
 */
export function HuntAreaGallery(props: HuntAreaGalleryProps): ReactElement {
  const { entries, item = false, title } = props;
  const size = item ? ITEM_SIZE : CREATURE_SIZE;
  const columns = item ? `repeat(8, ${size})` : `repeat(4, ${size})`;
  const cells = entries.map(renderCell(size));
  const emptyTitle = item ? ITEMS_EMPTY_TITLE : CREATURES_EMPTY_TITLE;
  const emptyDescription = item ? ITEMS_EMPTY_DESCRIPTION : CREATURES_EMPTY_DESCRIPTION;
  const content =
    entries.length === 0 ? (
      <Box height={EMPTY_HEIGHT}>
        <PanelState
          description={emptyDescription}
          icon="empty"
          title={emptyTitle}
          variant="empty"
        />
      </Box>
    ) : (
      <Box display="grid" gap="2" gridTemplateColumns={columns}>
        {cells}
      </Box>
    );
  return (
    <Box>
      <Text color="fg" marginBlockEnd="2" variant="section">
        {title}
      </Text>
      {content}
    </Box>
  );
}

function renderCell(size: string): (entry: HuntAreaEntry) => ReactElement {
  return function render(entry: HuntAreaEntry): ReactElement {
    const fill = huntAreaToneFill(entry.tone);
    const name = entry.name;
    const mark = (
      <Box aria-label={name} bg={fill} borderRadius="full" height={size} role="img" width={size} />
    );
    return (
      <Popup
        content={
          <Text color="fg" variant="name">
            {name}
          </Text>
        }
        key={name}
      >
        {mark}
      </Popup>
    );
  };
}
