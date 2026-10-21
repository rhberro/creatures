import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Text } from '~/shared/ui/text';

export function TermsNote(): ReactElement {
  return (
    <Box textAlign="center">
      <Text color="fg.subtle" variant="body">
        Ao continuar, você concorda com os Termos de Serviço e a Política de Privacidade do
        Creatures.
      </Text>
    </Box>
  );
}
