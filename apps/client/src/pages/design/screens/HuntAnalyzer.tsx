import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Frame } from '~/components/base/frame/Frame';
import { FrameFooter } from '~/components/base/frame/FrameFooter';
import { FrameHeader } from '~/components/base/frame/FrameHeader';
import { Text } from '~/components/base/text/Text';

const METRICS = [
  { label: 'Capturas', value: '3' },
  { label: 'Dano', value: '1.240' },
  { label: 'Drops', value: '7' },
  { label: 'Perdido', value: '180' },
];

export function HuntAnalyzer(): ReactElement {
  const metrics = METRICS.map(renderMetric);
  return (
    <Box display="flex" flexDirection="column" gap="2" width="280px">
      <SessionPanel />
      <Frame>
        <Box padding="3">
          <Text color="fg.muted" marginBlockEnd="3" variant="section">
            Análise
          </Text>
          <Box display="grid" gap="3" gridTemplateColumns="repeat(2, 1fr)">
            {metrics}
          </Box>
        </Box>
      </Frame>
    </Box>
  );
}

function SessionPanel(): ReactElement {
  return (
    <Frame accent>
      <FrameHeader>Caçada em andamento</FrameHeader>
      <Box display="flex" flexDirection="column" gap="2" padding="3">
        <SessionRow label="Local" value="Campina Cinzenta" />
        <SessionRow label="Tempo" value="00:42:18" />
        <SessionRow label="Restante" value="03:30:00" />
      </Box>
      <FrameFooter>
        <SessionFooter />
      </FrameFooter>
    </Frame>
  );
}

type SessionRowProps = {
  label: string;
  value: string;
};

function SessionRow(props: SessionRowProps): ReactElement {
  const { label, value } = props;
  return (
    <Box alignItems="center" display="flex" justifyContent="space-between">
      <Text color="fg.subtle" variant="meta">
        {label}
      </Text>
      <Text color="fg" variant="numeric">
        {value}
      </Text>
    </Box>
  );
}

function SessionFooter(): ReactElement {
  return (
    <Box alignItems="center" display="flex">
      <Box
        alignItems="center"
        bg="blood.600"
        borderRadius="sm"
        boxShadow="raised"
        color="blood.50"
        cursor="pointer"
        display="flex"
        height="32px"
        justifyContent="center"
        paddingInline="4"
        width="100%"
      >
        <Text variant="label">Finalizar Caçada</Text>
      </Box>
    </Box>
  );
}

function renderMetric(metric: { label: string; value: string }): ReactElement {
  return (
    <Box key={metric.label}>
      <Text color="fg.subtle" variant="meta">
        {metric.label}
      </Text>
      <Text color="fg" variant="numeric">
        {metric.value}
      </Text>
    </Box>
  );
}
