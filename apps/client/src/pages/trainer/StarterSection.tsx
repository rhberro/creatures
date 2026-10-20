import { Box, Spinner } from '@chakra-ui/react';
import type { Starter } from '@creatures/contracts/trainer';
import type { ReactElement } from 'react';

import { Text } from '~/components/base/text/Text';
import { StarterGrid } from '~/components/domain/trainer/StarterGrid';
import type { StarterEntry } from '~/components/domain/trainer/trainer.types';

type StarterSectionProps = {
  isLoading: boolean;
  onSelect: (id: string) => void;
  selectedId: string | null;
  starters: Starter[];
};

export function StarterSection(props: StarterSectionProps): ReactElement {
  const { isLoading, onSelect, selectedId, starters } = props;
  if (isLoading) {
    return <Spinner alignSelf="center" color="fg.muted" />;
  }
  const entries = starters.map(toStarterEntry);
  return (
    <Box>
      <Text color="fg.muted" marginBlockEnd="2" variant="meta">
        Criatura inicial
      </Text>
      <StarterGrid onSelect={onSelect} selectedId={selectedId} starters={entries} />
    </Box>
  );
}

function toStarterEntry(starter: Starter): StarterEntry {
  return { id: starter.id, name: starter.name };
}
