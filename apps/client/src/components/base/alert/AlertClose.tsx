import type { ReactElement } from 'react';

import { NativeButton } from '~/components/base/button/NativeButton';
import { IconClose } from '~/components/base/icon';
import { FOCUS_RING } from '~/theme/focus';

const CLOSE_SIZE = '32px';
const ICON_SIZE = '16px';

type AlertCloseProps = {
  onClick: () => void;
};

export function AlertClose(props: AlertCloseProps): ReactElement {
  const { onClick } = props;
  return (
    <NativeButton
      _focusVisible={FOCUS_RING}
      alignItems="center"
      aria-label="Fechar aviso"
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
      transitionProperty="background-color, color"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
      width={CLOSE_SIZE}
      onClick={onClick}
    >
      <IconClose size={ICON_SIZE} />
    </NativeButton>
  );
}
