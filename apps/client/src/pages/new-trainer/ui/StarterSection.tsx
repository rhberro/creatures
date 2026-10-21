import { Box, Spinner } from '@chakra-ui/react';
import type { StarterSpecies } from '@creatures/contracts/species';
import type { ReactElement } from 'react';

import { StarterGrid } from '~/entities/trainer';
import type { StarterEntry } from '~/entities/trainer';
import { Text } from '~/shared/ui/text';

const LABEL = 'Criatura inicial';
const ERROR_MESSAGE = 'Não foi possível carregar as criaturas iniciais.';
const EMPTY_MESSAGE = 'Nenhuma criatura inicial disponível.';

type StarterSectionProps = {
  isLoading: boolean;
  loadError: string | null;
  onSelect: (id: string) => void;
  selectedId: string | null;
  selectionError: string | null;
  starters: StarterSpecies[];
};

export function StarterSection(props: StarterSectionProps): ReactElement {
  const { isLoading, loadError, onSelect, selectedId, selectionError, starters } = props;
  if (isLoading) {
    return <Spinner alignSelf="center" color="fg.muted" />;
  }
  const entries = starters.map(toStarterEntry);
  const body = renderBody(loadError, entries, onSelect, selectedId);
  const message =
    selectionError === null ? null : (
      <Text color="fg.error" role="alert" variant="body">
        {selectionError}
      </Text>
    );
  return (
    <Box>
      <Text color="fg.muted" marginBlockEnd="1" variant="meta">
        {LABEL}
      </Text>
      {body}
      {message}
    </Box>
  );
}

function renderBody(
  loadError: string | null,
  entries: StarterEntry[],
  onSelect: (id: string) => void,
  selectedId: string | null,
): ReactElement {
  if (loadError !== null) {
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

function toStarterEntry(starter: StarterSpecies): StarterEntry {
  return { id: starter.id, name: starter.name };
}
