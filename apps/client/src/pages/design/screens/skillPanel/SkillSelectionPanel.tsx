import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Frame } from '~/components/base/frame/Frame';

import { AbilityCard } from './AbilityCard';
import { ABILITIES } from './data';
import { PanelHeader } from './PanelHeader';

export function SkillSelectionPanel(): ReactElement {
  const cards = ABILITIES.map(renderAbility);
  return (
    <Box width="300px">
      <Frame tone="overlay">
        <PanelHeader subtitle="Seleciona a habilidade para o slot 3." title="Habilidades" />
        <Box display="flex" flexDirection="column" gap="2" padding="3">
          {cards}
        </Box>
      </Frame>
    </Box>
  );
}

function renderAbility(ability: (typeof ABILITIES)[number]): ReactElement {
  return <AbilityCard ability={ability} key={ability.name} />;
}
