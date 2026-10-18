import { Box, Button, HStack, Text } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { useAlerts, type AlertItem } from '~/components/alert/AlertStack';

const BAR_HEIGHT = '2px';

export function Alert(props: AlertProps): ReactElement {
  const { item } = props;
  const { dismiss } = useAlerts();
  const barWidth = computeBarWidth(item.remaining, item.duration);

  function handleClose(): void {
    dismiss(item.id);
  }

  return (
    <Box
      bg="bg.panel"
      borderColor="border.default"
      borderRadius="md"
      borderWidth="1px"
      minW="64"
      position="relative"
      overflow="hidden"
    >
      <HStack align="flex-start" gap={3} p={3} pr={8}>
        <Box flexShrink="0">{item.icon}</Box>
        <Text color="fg" flex="1">
          {item.content}
        </Text>
      </HStack>
      <Button
        aria-label="Fechar"
        onClick={handleClose}
        position="absolute"
        right="1"
        size="xs"
        top="1"
        variant="ghost"
      >
        ×
      </Button>
      <Box
        bg="fg.muted"
        bottom="0"
        height={BAR_HEIGHT}
        left="0"
        position="absolute"
        width={barWidth}
      />
    </Box>
  );
}

export type AlertProps = {
  item: AlertItem;
};

function computeBarWidth(remaining: number, duration: number): string {
  if (duration <= 0) {
    return '0%';
  }
  const ratio = remaining / duration;
  if (ratio < 0) {
    return '0%';
  }
  if (ratio > 1) {
    return '100%';
  }
  return `${ratio * 100}%`;
}
