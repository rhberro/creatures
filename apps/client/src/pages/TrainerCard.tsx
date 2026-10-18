import { Box, Button, Stack, Text } from '@chakra-ui/react';
import type { Gender, Trainer } from '@creatures/contracts/trainer';
import type { MouseEvent, ReactElement } from 'react';

import type { TrainerClientErrorCode } from '~/trainers/trainersClient';

const SELECTED_BORDER_COLOR = 'blue.500';
const DEFAULT_BORDER_COLOR = 'border.default';
const CREATE_LABEL = '+ Criar treinador';
const DELETE_LABEL = 'Deletar';

const GENDER_LABELS: Record<Gender, string> = {
  female: 'Feminino',
  male: 'Masculino',
};

const PAGE_ERROR_MESSAGES: Record<TrainerClientErrorCode, string> = {
  invalid_gender: 'Gênero inválido.',
  invalid_name: 'Nome inválido.',
  invalid_starter: 'A criatura inicial informada é inválida.',
  max_trainers_reached: 'Você atingiu o limite de 5 treinadores.',
  name_taken: 'Nome indisponível.',
  trainer_not_found: 'Treinador não encontrado.',
  unauthenticated: 'Sessão expirada. Entre novamente.',
  unknown: 'Não foi possível carregar os treinadores.',
};

export function TrainerList(props: TrainerListProps): ReactElement {
  const { onDelete, onSelect, selectedId, trainers } = props;
  const cards = trainers.map(buildTrainerCardBuilder({ onDelete, onSelect, selectedId }));
  return (
    <Stack align="stretch" gap={3}>
      {cards}
    </Stack>
  );
}

export function CreateTrainerCard(props: CreateTrainerCardProps): ReactElement {
  const { onCreate } = props;
  return (
    <Button
      borderColor="border.default"
      borderStyle="dashed"
      borderWidth="2px"
      h="auto"
      p={4}
      variant="outline"
      w="full"
      onClick={onCreate}
    >
      {CREATE_LABEL}
    </Button>
  );
}

export function PageError(props: PageErrorProps): ReactElement {
  const { code } = props;
  return (
    <Text color="fg.error" textAlign="center">
      {PAGE_ERROR_MESSAGES[code]}
    </Text>
  );
}

function buildTrainerCardBuilder(deps: TrainerCardBuilderDeps): (trainer: Trainer) => ReactElement {
  return function buildCard(trainer: Trainer): ReactElement {
    const isSelected = trainer.id === deps.selectedId;
    return (
      <TrainerCard
        key={trainer.id}
        isSelected={isSelected}
        trainer={trainer}
        onDelete={deps.onDelete}
        onSelect={deps.onSelect}
      />
    );
  };
}

function TrainerCard(props: TrainerCardProps): ReactElement {
  const { isSelected, onDelete, onSelect, trainer } = props;
  const borderColor = isSelected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR;
  const genderLabel = GENDER_LABELS[trainer.gender];
  const subtitle = `${genderLabel} · Nível ${trainer.level}`;
  const initial = trainer.name.slice(0, 1).toUpperCase();

  function handleSelect(): void {
    onSelect(trainer.id);
  }

  function handleDeleteClick(event: MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    onDelete(trainer.id);
  }

  return (
    <Box
      alignItems="center"
      borderColor={borderColor}
      borderRadius="md"
      borderWidth="2px"
      cursor="pointer"
      display="flex"
      gap={3}
      p={4}
      onClick={handleSelect}
    >
      <TrainerBadge initial={initial} />
      <Stack flex={1} gap={0}>
        <Text fontWeight="bold">{trainer.name}</Text>
        <Text color="fg.muted" fontSize="sm">
          {subtitle}
        </Text>
      </Stack>
      <Button colorPalette="red" size="sm" variant="ghost" onClick={handleDeleteClick}>
        {DELETE_LABEL}
      </Button>
    </Box>
  );
}

function TrainerBadge(props: TrainerBadgeProps): ReactElement {
  const { initial } = props;
  return (
    <Box
      alignItems="center"
      bg="bg.muted"
      borderRadius="full"
      boxSize="40px"
      display="flex"
      fontWeight="bold"
      justifyContent="center"
    >
      {initial}
    </Box>
  );
}

export type TrainerListProps = {
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  selectedId: string | null;
  trainers: Trainer[];
};

export type CreateTrainerCardProps = {
  onCreate: () => void;
};

export type PageErrorProps = {
  code: TrainerClientErrorCode;
};

type TrainerCardBuilderDeps = {
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  selectedId: string | null;
};

type TrainerCardProps = {
  isSelected: boolean;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  trainer: Trainer;
};

type TrainerBadgeProps = {
  initial: string;
};
