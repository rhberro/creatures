import { Box } from '@chakra-ui/react';
import { useState, type ReactElement } from 'react';

import { IconBadge } from '~/components/base/badge/IconBadge';

import { ALERT_ENTER, ALERT_EXIT } from './alert.constants';
import type { AlertItem } from './alert.types';
import { AlertClose } from './AlertClose';
import { AlertProgress } from './AlertProgress';

type AlertProps = {
  item: AlertItem;
  onDismiss: (id: string) => void;
};

export function Alert(props: AlertProps): ReactElement {
  const { item, onDismiss } = props;
  const { content, duration, icon, id, isLeaving = false, remaining } = item;
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const isExiting = isClosing || isLeaving;
  const animation = isExiting ? ALERT_EXIT : ALERT_ENTER;

  function handleClose(): void {
    setIsClosing(true);
  }

  function handleAnimationEnd(): void {
    if (isExiting) {
      onDismiss(id);
    }
  }

  return (
    <Box
      alignItems="flex-start"
      animation={animation}
      bg="bg.panel"
      borderColor="border"
      borderRadius="sm"
      borderWidth="1px"
      boxShadow="overlay"
      display="flex"
      gap="3"
      maxW="full"
      padding="4"
      position="relative"
      width="full"
      onAnimationEnd={handleAnimationEnd}
    >
      <IconBadge size="36px">{icon}</IconBadge>
      <Box flex="1" minW="0" overflowWrap="anywhere" paddingBlockStart="1">
        {content}
      </Box>
      <AlertClose onClick={handleClose} />
      <AlertProgress duration={duration} remaining={remaining} />
    </Box>
  );
}
