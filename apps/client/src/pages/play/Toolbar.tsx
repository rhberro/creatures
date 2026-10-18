import { Box, Button, HStack, Stack, Text } from '@chakra-ui/react';
import type { ReactElement } from 'react';

const TRAINER_LEVEL = 1;
const TRAINER_NAME = 'Jogador';
const GOLD_AMOUNT = 1500;
const DIAMOND_AMOUNT = 1829201;

export function Toolbar(props: ToolbarProps): ReactElement {
  const { onOpenBackpack, onOpenSettings, onShowAlert, onOpenStorage, onSignOut } = props;
  return (
    <Box
      alignItems="center"
      bg="bg.panel"
      borderBottomColor="border.default"
      borderBottomWidth="1px"
      display="flex"
      h="16"
      justifyContent="space-between"
      px={4}
    >
      <ToolbarLeft
        onOpenBackpack={onOpenBackpack}
        onOpenStorage={onOpenStorage}
        onShowAlert={onShowAlert}
      />
      <ToolbarRight
        onOpenSettings={onOpenSettings}
        onShowAlert={onShowAlert}
        onSignOut={onSignOut}
      />
    </Box>
  );
}

export type ToolbarProps = {
  onOpenBackpack: () => void;
  onOpenSettings: () => void;
  onOpenStorage: () => void;
  onShowAlert: () => void;
  onSignOut: () => void;
};

function ToolbarLeft(props: ToolbarLeftProps): ReactElement {
  const { onOpenBackpack, onOpenStorage, onShowAlert } = props;
  return (
    <HStack gap={4}>
      <HStack gap={2}>
        <Box
          bg="bg.muted"
          borderColor="border.default"
          borderRadius="full"
          borderWidth="1px"
          h="10"
          w="10"
        />
        <Stack gap={0}>
          <Text color="fg" fontSize="sm">
            {TRAINER_NAME}
          </Text>
          <Text color="fg.muted" fontSize="xs">
            Level {TRAINER_LEVEL}
          </Text>
        </Stack>
      </HStack>
      <Box bg="border.default" h="8" w="1px" />
      <HStack gap={2}>
        <Button colorPalette="gray" size="sm" variant="ghost" onClick={onOpenBackpack}>
          Mochila
        </Button>
        <Button colorPalette="gray" size="sm" variant="ghost" onClick={onOpenStorage}>
          Armazenamento
        </Button>
        <Button colorPalette="gray" size="sm" variant="ghost" onClick={onShowAlert}>
          Alerta
        </Button>
      </HStack>
    </HStack>
  );
}

type ToolbarLeftProps = {
  onOpenBackpack: () => void;
  onOpenStorage: () => void;
  onShowAlert: () => void;
};

function ToolbarRight(props: ToolbarRightProps): ReactElement {
  const { onOpenSettings, onShowAlert, onSignOut } = props;
  return (
    <HStack gap={4}>
      <HStack gap={3}>
        <CurrencyBadge amount={GOLD_AMOUNT} label="gold" />
        <CurrencyBadge amount={DIAMOND_AMOUNT} label="diamond" />
      </HStack>
      <HStack gap={2}>
        <Button colorPalette="gray" size="sm" variant="ghost" onClick={onShowAlert}>
          Notif.
        </Button>
        <Button colorPalette="gray" size="sm" variant="ghost" onClick={onShowAlert}>
          Social
        </Button>
        <Button colorPalette="gray" size="sm" variant="ghost" onClick={onOpenSettings}>
          Config.
        </Button>
        <Button colorPalette="gray" size="sm" variant="ghost" onClick={onSignOut}>
          Sair
        </Button>
      </HStack>
    </HStack>
  );
}

type ToolbarRightProps = {
  onOpenSettings: () => void;
  onShowAlert: () => void;
  onSignOut: () => void;
};

function CurrencyBadge(props: CurrencyBadgeProps): ReactElement {
  const { amount, label } = props;
  const dotColor = colorForCurrency(label);
  const amountText = formatAmount(amount);
  return (
    <HStack
      alignItems="center"
      bg="bg.muted"
      borderColor="border.default"
      borderRadius="full"
      borderWidth="1px"
      gap={2}
      h="8"
      px={3}
    >
      <Box bg={dotColor} borderRadius="full" h="3" w="3" />
      <Text color="fg" fontSize="sm">
        {amountText}
      </Text>
    </HStack>
  );
}

export type CurrencyBadgeProps = {
  amount: number;
  label: CurrencyLabel;
};

export type CurrencyLabel = 'diamond' | 'gold';

function colorForCurrency(label: CurrencyLabel): string {
  return label === 'gold' ? 'currency.gold' : 'currency.diamond';
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('pt-BR');
}
