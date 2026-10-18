import { Box, Stack } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Alert } from '~/components/alert/Alert';
import { useAlerts, type AlertItem } from '~/components/alert/AlertStack';

export function AlertsViewport(): ReactElement {
  const { alerts } = useAlerts();
  const alertNodes = alerts.map(renderAlert);
  return (
    <Box position="fixed" right="4" top="4" zIndex="toast">
      <Stack gap={2}>{alertNodes}</Stack>
    </Box>
  );
}

function renderAlert(item: AlertItem): ReactElement {
  return <Alert item={item} key={item.id} />;
}
