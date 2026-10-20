import { Box } from '@chakra-ui/react';
import type { Trainer } from '@creatures/contracts/trainer';
import type { ReactElement } from 'react';

import { TrainerCard } from './TrainerCard';

type TrainerListProps = {
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  selectedId: string | null;
  trainers: Trainer[];
};

export function TrainerList(props: TrainerListProps): ReactElement {
  const { onDelete, onSelect, selectedId, trainers } = props;
  const cards = trainers.map(buildTrainerCardBuilder({ onDelete, onSelect, selectedId }));
  return (
    <Box display="flex" flexDirection="column" gap="2">
      {cards}
    </Box>
  );
}

type TrainerCardBuilderDeps = {
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  selectedId: string | null;
};

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
