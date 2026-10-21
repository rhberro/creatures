import { Box } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

import { SlotGrid } from '~/shared/ui/frame';

type SlotGridAreaProps = {
  children: ReactNode;
};

/**
 * A grade de slots dentro da area visivel.
 *
 * A area e o que o painel oferece: o fundo dele e o que fica em volta da
 * grade. A grade em si e a `SlotGrid`, com a regra unica do design system: a
 * ultima fileira fecha com slots vazios e a grade nao cria fileira nova.
 *
 * A area nao inventa fileira: ela mostra o fundo do painel, nao slots vazios
 * para preencher a altura. Por isso a grade de um treinador com uma criatura
 * so e uma fileira.
 */
export function SlotGridArea(props: SlotGridAreaProps): ReactElement {
  const { children } = props;
  return (
    <Box height="full" width="full">
      <SlotGrid>{children}</SlotGrid>
    </Box>
  );
}
