import { Box } from '@chakra-ui/react';
import type { ChangeEvent, ReactElement } from 'react';

import { SEARCH_PLACEHOLDER, SEARCH_WIDTH } from '~/features/storage/ui/storageModal.constants';
import { TextField } from '~/shared/ui/field';
import { Text } from '~/shared/ui/text';

type StorageFooterProps = {
  /** The message of the failure of the last command, when there is one. */
  error: string | null;
  onSearchChange(event: ChangeEvent<HTMLInputElement>): void;
  search: string;
};

/**
 * The footer of the storage: the field of the search on the right, and the
 * failure of the last command on the left.
 */
export function StorageFooter(props: StorageFooterProps): ReactElement {
  const { error, onSearchChange, search } = props;
  const errorMessage =
    error === null ? null : (
      <Text color="fg.error" variant="meta">
        {error}
      </Text>
    );
  const searchField = (
    <TextField
      aria-label={SEARCH_PLACEHOLDER}
      clearable
      name="buscar-armazenamento"
      onChange={onSearchChange}
      placeholder={SEARCH_PLACEHOLDER}
      value={search}
    />
  );
  return (
    <Box alignItems="center" display="flex" gap="2" width="full">
      {errorMessage}
      <Box marginInlineStart="auto" maxW={SEARCH_WIDTH} width="full">
        {searchField}
      </Box>
    </Box>
  );
}
