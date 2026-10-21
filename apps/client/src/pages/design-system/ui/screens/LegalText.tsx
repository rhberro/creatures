import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { IconCoin, IconSearch } from '~/shared/ui/icon';
import { Text } from '~/shared/ui/text';

export function LegalText(): ReactElement {
  return (
    <Box>
      <Text color="fg.muted" marginBlockEnd="3" variant="body">
        Este documento descreve os termos de uso do Creatures. O texto definitivo ainda não foi
        escrito, e o que está aqui é apenas a estrutura do documento.
      </Text>
      <Text color="fg.muted" marginBlockEnd="3" variant="body">
        A conta, os treinadores, as criaturas, os itens e o progresso do jogador são os dados
        cobertos. O jogo roda em navegador e sincroniza o estado pelo servidor.
      </Text>
      <Box alignItems="center" display="flex" gap="2" marginBlockEnd="3">
        <Box color="currency.gold">
          <IconCoin />
        </Box>
        <Text color="fg.subtle" variant="meta">
          Placeholder
        </Text>
      </Box>
      <Box alignItems="center" display="flex" gap="2">
        <Box color="fg.muted">
          <IconSearch />
        </Box>
        <Text color="fg.subtle" variant="meta">
          Placeholder
        </Text>
      </Box>
    </Box>
  );
}
