import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Frame } from '~/components/base/frame/Frame';

import { AbilityCard } from './AbilityCard';
import { DEVICES } from './data';
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
