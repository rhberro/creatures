import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import type { StarterEntry } from '~/entities/trainer/model/trainer.types';

import { StarterCard } from './StarterCard';

const GRID_COLUMNS = 'repeat(3, 1fr)';

type StarterGridProps = {
  onSelect: (id: string) => void;
  selectedId: string | null;
  starters: StarterEntry[];
};

export function StarterGrid(props: StarterGridProps): ReactElement {
  const { onSelect, selectedId, starters } = props;
  const cards = starters.map(buildStarterCard(onSelect, selectedId));
  return (
    <Box display="grid" gap="3" gridTemplateColumns={GRID_COLUMNS} width="full">
      {cards}
    </Box>
  );
}

function buildStarterCard(
  onSelect: (id: string) => void,
  selectedId: string | null,
): (starter: StarterEntry) => ReactElement {
  return function buildCard(starter: StarterEntry): ReactElement {
    const isSelected = starter.id === selectedId;
    return (
      <StarterCard
        key={starter.id}
        isSelected={isSelected}
        starterId={starter.id}
        starterName={starter.name}
        onSelect={onSelect}
      />
    );
  };
}
