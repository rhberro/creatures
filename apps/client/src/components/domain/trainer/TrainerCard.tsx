import { Box } from '@chakra-ui/react';
import type { Trainer } from '@creatures/contracts/trainer';
import type { MouseEvent, ReactElement } from 'react';

import { IconClose, IconTeam } from '~/components/base/icon';
import { Pressable } from '~/components/base/interactive/Pressable';
import { Text } from '~/components/base/text/Text';
import { SELECTED_RING } from '~/theme/selection';

const GENDER_LABELS = {
  female: 'Feminino',
  male: 'Masculino',
} as const;

const AVATAR_SIZE = '36px';

type TrainerCardProps = {
  isSelected: boolean;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  trainer: Trainer;
};

export function TrainerCard(props: TrainerCardProps): ReactElement {
  const { isSelected, onDelete, onSelect, trainer } = props;
  const ring = isSelected ? SELECTED_RING : undefined;
  const genderLabel = GENDER_LABELS[trainer.gender];
  const subtitle = `${genderLabel} · Nível ${trainer.level}`;

  function handleSelect(): void {
    onSelect(trainer.id);
  }

  function handleDeleteClick(event: MouseEvent<HTMLDivElement>): void {
    event.stopPropagation();
    onDelete(trainer.id);
  }

  return (
    <Pressable onPress={handleSelect}>
      <Box
        _before={ring}
        alignItems="center"
        bg="bg.raised"
        borderRadius="sm"
        boxShadow="raised"
        display="flex"
        gap="3"
        p="2"
        position="relative"
        transitionProperty="box-shadow"
        transitionDuration="150ms"
        transitionTimingFunction="ease-out"
      >
        <TrainerAvatar />
        <Box flex="1" minW="0">
          <Text color="fg" overflow="hidden" variant="name" whiteSpace="nowrap">
            {trainer.name}
          </Text>
          <Text color="fg.muted" overflow="hidden" variant="meta" whiteSpace="nowrap">
            {subtitle}
          </Text>
        </Box>
        <DeleteControl onClick={handleDeleteClick} />
      </Box>
    </Pressable>
  );
}

type DeleteControlProps = {
  onClick: (event: MouseEvent<HTMLDivElement>) => void;
};

function DeleteControl(props: DeleteControlProps): ReactElement {
  const { onClick } = props;
  return (
    <Box
      alignItems="center"
      color="fg.subtle"
      cursor="pointer"
      display="flex"
      flexShrink="0"
      height={AVATAR_SIZE}
      justifyContent="center"
      transitionProperty="color"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
      width={AVATAR_SIZE}
      onClick={onClick}
    >
      <IconClose />
    </Box>
  );
}

function TrainerAvatar(): ReactElement {
  return (
    <Box
      alignItems="center"
      bg="bg.sunken"
      borderRadius="full"
      boxShadow="recessed"
      color="fg.muted"
      display="flex"
      flexShrink="0"
      height={AVATAR_SIZE}
      justifyContent="center"
      width={AVATAR_SIZE}
    >
      <IconTeam />
    </Box>
  );
}
