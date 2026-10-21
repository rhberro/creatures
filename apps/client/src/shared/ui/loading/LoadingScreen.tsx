import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Text } from '~/shared/ui/text';

const TITLE = 'Creatures';
const MESSAGE = 'Carregando';
const DEFAULT_MIN_HEIGHT = '100dvh';

/**
 * A tela de carregamento.
 *
 * A marca do jogo e o anel que gira. A tela aparece enquanto o modulo da rota
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
      <Text color="fg" variant="title">
        {TITLE}
      </Text>
      <Box
        borderColor="accent.arcane"
        borderRadius="full"
        borderStyle="solid"
        borderTopColor="transparent"
        borderWidth="2px"
        height="28px"
        marginBlockStart="6"
        width="28px"
      />
      <Text color="fg.subtle" marginBlockStart="4" variant="meta">
        {MESSAGE}
      </Text>
    </Box>
  );
}

export type LoadingScreenProps = {
  minHeight?: string;
};
