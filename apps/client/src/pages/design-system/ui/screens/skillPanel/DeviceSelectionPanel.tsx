import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { DEVICES } from '~/pages/design-system/model/skillPanelData';
import { Frame } from '~/shared/ui/frame';

import { AbilityCard } from './AbilityCard';
import { PanelHeader } from './PanelHeader';

export function DeviceSelectionPanel(): ReactElement {
  const cards = DEVICES.map(renderDevice);
  return (
    <Box width="260px">
      <Frame tone="overlay">
        <PanelHeader subtitle="Escolha o dispositivo do slot 7." title="Dispositivos" />
        <Box display="flex" flexDirection="column" gap="2" padding="3">
          {cards}
        </Box>
      </Frame>
    </Box>
  );
}

function renderDevice(device: (typeof DEVICES)[number]): ReactElement {
  return <AbilityCard ability={device} key={device.name} />;
}
