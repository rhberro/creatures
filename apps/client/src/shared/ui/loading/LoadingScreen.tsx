import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { LoadingIndicator } from './LoadingIndicator';

const TITLE = 'Creatures';
const MESSAGE = 'Carregando';
const DEFAULT_MIN_HEIGHT = '100dvh';

/**
 * A tela de carregamento.
 *
 * A marca do jogo e o carregamento. A tela aparece enquanto o modulo da rota
 * entra: quem entra para jogar nao ve uma pagina em branco, e sim o jogo
 * carregando.
 */
export function LoadingScreen(props: LoadingScreenProps): ReactElement {
  const { minHeight = DEFAULT_MIN_HEIGHT } = props;
  return (
    <Box
      alignItems="center"
      bg="bg"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      minH={minHeight}
      width="100%"
    >
      <LoadingIndicator
        message={MESSAGE}
        messageVariant="meta"
        title={TITLE}
        titleVariant="title"
      />
    </Box>
  );
}

export type LoadingScreenProps = {
  minHeight?: string;
};
