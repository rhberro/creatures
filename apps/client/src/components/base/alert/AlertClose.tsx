import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { IconClose } from '~/components/base/icon';
import { FOCUS_BORDER } from '~/theme/focus';

const CLOSE_SIZE = '32px';

type AlertCloseProps = {
  onClick: () => void;
};

export function AlertClose(props: AlertCloseProps): ReactElement {
  const { onClick } = props;
  return (
    <Box
      _focusVisible={FOCUS_BORDER}
      alignItems="center"
      bg="bg.raised"
      borderColor="border"
      borderRadius="full"
      borderWidth="1px"
      color="fg.muted"
      cursor="pointer"
      display="flex"
      flexShrink="0"
      height={CLOSE_SIZE}
      justifyContent="center"
      role="button"
      tabIndex={0}
      transitionProperty="background-color, color"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
      width={CLOSE_SIZE}
      onClick={onClick}
    >
      <IconClose size="16px" />
    </Box>
  );
}
