import { Box, Stack } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Alert } from '~/components/base/alert/Alert';
import { useAlerts } from '~/components/base/alert/useAlerts';

import type { AlertItem } from './alert.types';

const VIEWPORT_MAX_WIDTH = '420px';
const VIEWPORT_GUTTER = '16px';
const VIEWPORT_WIDTH = `calc(100% - ${VIEWPORT_GUTTER} * 2)`;

export function AlertsViewport(): ReactElement {
  const { alerts, dismiss } = useAlerts();
  const alertNodes = alerts.map(renderAlert(dismiss));
  return (
    <Box
      maxW={VIEWPORT_MAX_WIDTH}
      pointerEvents="none"
      position="fixed"
      right={VIEWPORT_GUTTER}
      top={VIEWPORT_GUTTER}
      width={VIEWPORT_WIDTH}
      zIndex="toast"
    >
      <Stack gap="2" pointerEvents="auto">
        {alertNodes}
      </Stack>
    </Box>
  );
}

function renderAlert(dismiss: (id: string) => void): (item: AlertItem) => ReactElement {
  return function render(item: AlertItem): ReactElement {
    return <Alert item={item} key={item.id} onDismiss={dismiss} />;
  };
}
