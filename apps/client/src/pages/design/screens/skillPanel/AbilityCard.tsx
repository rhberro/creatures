import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { IconBolt, IconPotion, IconPrism } from '~/components/base/icon';
import { Pressable } from '~/components/base/interactive/Pressable';
import { Text } from '~/components/base/text/Text';
import { SELECTED_RING } from '~/theme/selection';

import type { Ability } from './data';

type AbilityCardProps = {
  ability: Ability;
};

export function AbilityCard(props: AbilityCardProps): ReactElement {
  const { ability } = props;
  const background = ability.equipped ? 'bg.raised' : 'transparent';
  const glyph = renderGlyph(ability.element);
  const ring = ability.equipped ? SELECTED_RING : undefined;
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
