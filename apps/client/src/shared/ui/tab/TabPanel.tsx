import { Tabs as ChakraTabs } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import type { TabPanelProps } from './tab.types';

/**
 * O painel de uma aba: o conteudo que a aba controla.
 *
 * Uma aba sem painel nao e uma aba — e um botao. Por isso o painel vem
 * junto com o `Tabs.Trigger`.
 *
 * O painel **nao** tem anel de foco. O `Tabs.Content` do Chakra desenha um
 * contorno no conteudo inteiro quando ele recebe o foco, e um contorno em
 * volta de metade do modal e pior do que nenhum. O foco na aba ja mostra
 * onde o usuario esta.
 */
export function TabPanel(props: TabPanelProps): ReactElement {
  const { children, value } = props;
  return (
    <ChakraTabs.Content focusVisibleRing="none" paddingTop="0" value={value}>
      {children}
    </ChakraTabs.Content>
  );
}
