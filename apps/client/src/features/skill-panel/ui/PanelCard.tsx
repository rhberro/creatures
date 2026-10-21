import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import type { PanelCardEntry } from '~/features/skill-panel/model/skillPanel.types';
import { useSelectionRing } from '~/shared/theme';
import { IconBolt, IconPotion, IconPrism } from '~/shared/ui/icon';
import { Pressable } from '~/shared/ui/interactive';
import { Text } from '~/shared/ui/text';

type PanelCardProps = {
  entry: PanelCardEntry;
  onSelect: (id: string) => void;
};

/**
 * One item of a selection panel.
 *
 * The card is the same in the three panels: what changes is the data it
 * carries. The item that is already equipped in the slot the panel edits is
 * the selected one, and clicking it again empties the slot.
 */
export function PanelCard(props: PanelCardProps): ReactElement {
  const { entry, onSelect } = props;
  const selectionRing = useSelectionRing();
  const background = entry.selected ? 'bg.raised' : 'transparent';
  const ring = entry.selected ? selectionRing : undefined;
  const glyphColor = readGlyphColor(entry.kind);
  const glyph = renderGlyph(entry.kind);

  function handlePress(): void {
    onSelect(entry.id);
  }

  return (
    <Pressable disabled={entry.disabled} onPress={handlePress} width="full">
      <Box
        _before={ring}
        alignItems="center"
        bg={background}
        borderColor="border"
        borderRadius="sm"
        borderWidth="1px"
        display="flex"
        gap="3"
        padding="2"
        position="relative"
        textAlign="left"
        width="full"
      >
        <Box
          alignItems="center"
          bg="bg.sunken"
          borderRadius="xs"
          boxShadow="recessed"
          color={glyphColor}
          display="flex"
          height="34px"
          justifyContent="center"
          width="34px"
        >
          {glyph}
        </Box>
        <PanelCardText entry={entry} />
      </Box>
    </Pressable>
  );
}

type PanelCardTextProps = {
  entry: PanelCardEntry;
};

function PanelCardText(props: PanelCardTextProps): ReactElement {
  const { entry } = props;
  const descriptionNode =
    entry.description === null ? null : (
      <Text
        color="fg.muted"
        overflow="hidden"
        textOverflow="ellipsis"
        variant="body"
        whiteSpace="nowrap"
      >
        {entry.description}
      </Text>
    );
  const noteNode =
    entry.note === null ? null : (
      <Text color="fg.subtle" variant="meta">
        {entry.note}
      </Text>
    );
  return (
    <Box minW="0">
      <Text color="fg" overflow="hidden" variant="name" whiteSpace="nowrap">
        {entry.name}
      </Text>
      {descriptionNode}
      {noteNode}
    </Box>
  );
}

/**
 * The color of the glyph of the card.
 *
 * The color tells the kind of the item apart, and the name of the item is
 * what carries the information: a color alone is not information.
 */
function readGlyphColor(kind: PanelCardEntry['kind']): string {
  if (kind === 'consumable') {
    return 'verdant.fg';
  }
  if (kind === 'device') {
    return 'frost.fg';
  }
  return 'fg.subtle';
}

function renderGlyph(kind: PanelCardEntry['kind']): ReactElement {
  if (kind === 'consumable') {
    return <IconPotion />;
  }
  if (kind === 'device') {
    return <IconPrism />;
  }
  return <IconBolt />;
}
