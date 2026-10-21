import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import type { Ability } from '~/pages/design-system/model/skillPanelData';
import { useSelectionRing } from '~/shared/theme';
import { IconBolt, IconPotion, IconPrism } from '~/shared/ui/icon';
import { Pressable } from '~/shared/ui/interactive';
import { Text } from '~/shared/ui/text';

type AbilityCardProps = {
  ability: Ability;
};

export function AbilityCard(props: AbilityCardProps): ReactElement {
  const { ability } = props;
  const selectionRing = useSelectionRing();
  const background = ability.equipped ? 'bg.raised' : 'transparent';
  const glyph = renderGlyph(ability.element);
  const ring = ability.equipped ? selectionRing : undefined;
  return (
    <Pressable disabled={ability.disabled} onPress={noop}>
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
      >
        <Box
          alignItems="center"
          bg="bg.sunken"
          borderRadius="xs"
          boxShadow="recessed"
          color={ability.tone}
          display="flex"
          height="34px"
          justifyContent="center"
          width="34px"
        >
          {glyph}
        </Box>
        <AbilityText ability={ability} />
      </Box>
    </Pressable>
  );
}

type AbilityTextProps = {
  ability: Ability;
};

function AbilityText(props: AbilityTextProps): ReactElement {
  const { ability } = props;
  return (
    <Box minW="0">
      <Text color="fg" overflow="hidden" variant="name" whiteSpace="nowrap">
        {ability.name}
      </Text>
      <Text
        color="fg.muted"
        overflow="hidden"
        textOverflow="ellipsis"
        variant="body"
        whiteSpace="nowrap"
      >
        {ability.description}
      </Text>
      <Text color="fg.subtle" variant="meta">
        {ability.note}
      </Text>
    </Box>
  );
}

function noop(): void {
  void 0;
}

function renderGlyph(element: string): ReactElement {
  if (element === 'hunt') {
    return <IconPotion />;
  }
  if (element === 'ice') {
    return <IconPrism />;
  }
  return <IconBolt />;
}
