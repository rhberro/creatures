import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Text } from '~/components/base/text/Text';

import { AlertSample } from './screens/AlertSample';
import { LayerModes } from './screens/LayerModes';
import { PopupSample } from './screens/PopupSample';
import { StateCoverage } from './screens/StateCoverage';
import { SectionHeader } from './SectionHeader';

export function StatesSection(): ReactElement {
  return (
    <Box marginBlockEnd="16">
      <SectionHeader
        description="Toda superfície que carrega ou aceita dados precisa dos cinco estados: carregando, vazio, erro, populado e limite. A mochila, o armazenamento, a loja, a lista de treinadores e a área de caça têm exatamente a mesma anatomia. O estado populado é o que se desenha primeiro e o que mais some, e é por isso que ele é o mais difícil de acertar."
        id="estados"
        title="Estados"
      />
      <StateCoverage />
      <Box display="flex" gap="8" marginBlockStart="10">
        <Box>
          <Text color="fg.muted" marginBlockEnd="2" variant="meta">
            Alerta
          </Text>
          <AlertSample />
        </Box>
        <Box>
          <Text color="fg.muted" marginBlockEnd="2" variant="meta">
            Popup
          </Text>
          <PopupSample />
        </Box>
      </Box>
      <Box marginBlockStart="10">
        <Text color="fg.muted" marginBlockEnd="3" variant="meta">
          Camadas
        </Text>
        <LayerModes />
      </Box>
    </Box>
  );
}
