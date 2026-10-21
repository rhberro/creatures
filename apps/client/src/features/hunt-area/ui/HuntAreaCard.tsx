import { Box } from '@chakra-ui/react';
import type { HuntArea, HuntAreaSpecies } from '@creatures/contracts/hunt';
import type { ReactElement } from 'react';

import { HUNT_AREA_TONE_COLORS, huntAreaToneFill } from '~/features/hunt-area/model/huntAreaTone';
import { HuntAreaCircles } from '~/features/hunt-area/ui/HuntAreaCircles';
import { DIVIDER_BOTTOM } from '~/shared/theme';
import { Pressable } from '~/shared/ui/interactive';
import { Popup } from '~/shared/ui/popup';
import { Text } from '~/shared/ui/text';

const PORTRAIT_SIZE = '84px';

type HuntAreaCardProps = {
  area: HuntArea;
  onPress: (area: HuntArea) => void;
};

/**
 * The card of an area.
 *
 * From top to bottom: the name of the area, the creature that represents it,
 * the other creatures of the place and the recommended level.
 *
 * The portrait of the creature and the circles open the popup with the name
 * of the species.
 */
export function HuntAreaCard(props: HuntAreaCardProps): ReactElement {
  const { area, onPress } = props;
  const primary = area.species.at(0);
  const others = area.species.slice(1);
  const tone = HUNT_AREA_TONE_COLORS[area.tone];
  const portraitFill = primary === undefined ? tone.fill : huntAreaToneFill(primary.tone);
  const levelLabel = `Recomendado ${area.recommendedLevel} - Mínimo ${area.minimumLevel}`;
  const portrait = renderPortrait(primary, portraitFill, tone.border);

  function handlePress(): void {
    onPress(area);
  }

  return (
    <Pressable onPress={handlePress} width="full">
      <Box
        bg="bg.raised"
        borderColor="border"
        borderRadius="sm"
        borderWidth="1px"
        overflow="hidden"
        width="full"
      >
        <Box css={DIVIDER_BOTTOM} paddingBlock="2" textAlign="center">
          <Text color="fg" variant="name">
            {area.name}
          </Text>
        </Box>
        <Box alignItems="center" display="flex" flexDirection="column" gap="3" padding="3">
          {portrait}
          <HuntAreaCircles species={others} />
          <Text color="fg.subtle" variant="meta">
            {levelLabel}
          </Text>
        </Box>
      </Box>
    </Pressable>
  );
}

function renderPortrait(
  primary: HuntAreaSpecies | undefined,
  fill: string,
  border: string,
): ReactElement {
  if (primary === undefined) {
    return (
      <Box
        bg={fill}
        borderColor={border}
        borderRadius="full"
        borderWidth="1px"
        boxShadow="recessed"
        height={PORTRAIT_SIZE}
        width={PORTRAIT_SIZE}
      />
    );
  }
  const name = primary.species.name;
  const mark = (
    <Box
      aria-label={name}
      bg={fill}
      borderColor={border}
      borderRadius="full"
      borderWidth="1px"
      boxShadow="recessed"
      height={PORTRAIT_SIZE}
      role="img"
      width={PORTRAIT_SIZE}
    />
  );
  return (
    <Popup
      content={
        <Text color="fg" variant="name">
          {name}
        </Text>
      }
    >
      {mark}
    </Popup>
  );
}
