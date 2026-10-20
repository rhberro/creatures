import { Box, Spinner } from '@chakra-ui/react';
import type { Starter } from '@creatures/contracts/trainer';
import type { ReactElement } from 'react';

import { Text } from '~/components/base/text/Text';
import { StarterGrid } from '~/components/domain/trainer/StarterGrid';
import type { StarterEntry } from '~/components/domain/trainer/trainer.types';

const LABEL = 'Criatura inicial';
const ERROR_MESSAGE = 'Não foi possível carregar as criaturas iniciais.';
const EMPTY_MESSAGE = 'Nenhuma criatura inicial disponível.';

type StarterSectionProps = {
  error: string | null;
  isLoading: boolean;
  onSelect: (id: string) => void;
  selectedId: string | null;
  starters: Starter[];
};

export function StarterSection(props: StarterSectionProps): ReactElement {
  const { error, isLoading, onSelect, selectedId, starters } = props;
  if (isLoading) {
    return <Spinner alignSelf="center" color="fg.muted" />;
  }
  const entries = starters.map(toStarterEntry);
  const body = renderBody(error, entries, onSelect, selectedId);
  return (
    <Box>
      <Text color="fg.muted" marginBlockEnd="1" variant="meta">
        {LABEL}
      </Text>
      {body}
    </Box>
  );
}

function renderBody(
  error: string | null,
  entries: StarterEntry[],
  onSelect: (id: string) => void,
  selectedId: string | null,
): ReactElement {
  if (error !== null) {
    return (
      <Text color="fg.error" variant="body">
        {ERROR_MESSAGE}
      </Text>
    );
  }
  if (entries.length === 0) {
    return (
      <Text color="fg.muted" variant="body">
        {EMPTY_MESSAGE}
      </Text>
    );
  }
  return <StarterGrid onSelect={onSelect} selectedId={selectedId} starters={entries} />;
}

function toStarterEntry(starter: Starter): StarterEntry {
  return { id: starter.id, name: starter.name };
}
