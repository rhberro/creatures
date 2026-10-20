import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Frame } from '~/components/base/frame/Frame';
import { Text } from '~/components/base/text/Text';

import { AbilityCard } from './AbilityCard';
import { CONSUMABLES } from './data';
import { PanelHeader } from './PanelHeader';

export function ConsumableSelectionPanel(): ReactElement {
  const cards = CONSUMABLES.map(renderConsumable);
  return (
    <Box width="300px">
      <Frame tone="overlay">
        <PanelHeader subtitle="Escolha o consumível do slot 5." title="Consumíveis" />
        <Box padding="3">
          <TriggerControl />
          <Box display="flex" flexDirection="column" gap="2" marginBlockStart="3">
            {cards}
          </Box>
        </Box>
      </Frame>
    </Box>
  );
}

function TriggerControl(): ReactElement {
  return (
    <Box bg="bg.sunken" borderRadius="sm" boxShadow="recessed" padding="2">
      <Text color="fg.muted" variant="meta">
        Usar quando a vida for menor que
      </Text>
      <Box alignItems="center" display="flex" gap="2" marginBlockStart="1">
        <TriggerButton label="−" />
        <Text color="fg" minW="42px" textAlign="center" variant="numeric">
          30%
        </Text>
        <TriggerButton label="+" />
        <Box bg="border" flex="1" height="4px">
          <Box bg="arcane.400" height="100%" width="30%" />
        </Box>
      </Box>
    </Box>
  );
}

type TriggerButtonProps = {
  label: string;
};

function TriggerButton(props: TriggerButtonProps): ReactElement {
  const { label } = props;
  return (
    <Box
      alignItems="center"
      bg="bg.raised"
      borderColor="border"
      borderRadius="sm"
      borderWidth="1px"
      color="fg.muted"
      cursor="pointer"
      display="flex"
      height="26px"
      justifyContent="center"
      width="26px"
    >
      <Text variant="numeric">{label}</Text>
    </Box>
  );
}

function renderConsumable(consumable: (typeof CONSUMABLES)[number]): ReactElement {
  return <AbilityCard ability={consumable} key={consumable.name} />;
}
