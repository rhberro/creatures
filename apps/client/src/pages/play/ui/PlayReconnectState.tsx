import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Button } from '~/shared/ui/button';
import { Text } from '~/shared/ui/text';

const TITLE = 'Conexão perdida';
const DESCRIPTION =
  'Você perdeu a conexão com o servidor. Clique no botão abaixo para tentar se reconectar.';
const BUTTON_LABEL = 'Reconectar';

export type PlayReconnectStateProps = {
  detail?: string | null;
  onRetry: () => void;
};

/**
 * The state of the screen of the game when the connection with the server is
 * gone.
 *
 * There is no automatic reconnection: the button is the one that tries again.
 */
export function PlayReconnectState(props: PlayReconnectStateProps): ReactElement {
  const { detail = null, onRetry } = props;
  const detailNode = renderDetail(detail);
  return (
    <Box
      alignItems="center"
      bg="bg"
      display="flex"
      flexDirection="column"
      height="100dvh"
      justifyContent="center"
      width="100%"
    >
      <Text color="fg" variant="title">
        {TITLE}
      </Text>
      <Text color="fg.muted" marginBlockStart="2" maxW="42ch" textAlign="center" variant="body">
        {DESCRIPTION}
      </Text>
      {detailNode}
      <Box marginBlockStart="6">
        <Button tone="primary" onClick={onRetry}>
          {BUTTON_LABEL}
        </Button>
      </Box>
    </Box>
  );
}

function renderDetail(detail: string | null): ReactElement | null {
  if (detail === null) {
    return null;
  }
  return (
    <Text color="fg.subtle" marginBlockStart="4" maxW="42ch" textAlign="center" variant="meta">
      {detail}
    </Text>
  );
}
