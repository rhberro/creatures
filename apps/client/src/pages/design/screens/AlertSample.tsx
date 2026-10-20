import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Alert } from '~/components/base/alert/Alert';
import type { AlertItem } from '~/components/base/alert/alert.types';
import { IconBadge } from '~/components/base/badge/IconBadge';
import { IconPotion } from '~/components/base/icon';
import { Text } from '~/components/base/text/Text';

const ALERT_DURATION = 6000;
const ALERT_REMAINING = 3700;

const SAMPLE_ITEM: AlertItem = {
  content: (
    <Box>
      <Text color="fg" variant="label">
        Poção de Cura
      </Text>
      <Text color="fg.muted" variant="meta">
        Adicionada à mochila
      </Text>
    </Box>
  ),
  duration: ALERT_DURATION,
  icon: (
    <IconBadge tone="arcane.300">
      <IconPotion />
    </IconBadge>
  ),
  id: 'sample',
  remaining: ALERT_REMAINING,
};

export function AlertSample(): ReactElement {
  return (
    <Box width="320px">
      <Alert item={SAMPLE_ITEM} onDismiss={noop} />
    </Box>
  );
}

function noop(): void {
  void 0;
}
