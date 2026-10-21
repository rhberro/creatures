import type { ReactElement } from 'react';

import { NativeButton } from '~/shared/ui/button';
import { IconClose } from '~/shared/ui/icon';

const CLEAR_SIZE = '14px';
const CLEAR_TARGET = '24px';

type ClearControlProps = {
  onClick: () => void;
};

/**
 * O X que limpa o campo.
 *
 * E um `<button>` de verdade: um `Box` com `onClick` nao responde a Enter nem
 * a Espaco, nao some do foco e o leitor de tela anuncia uma div.
 */
export function ClearControl(props: ClearControlProps): ReactElement {
  const { onClick } = props;
  return (
    <NativeButton
      alignItems="center"
      aria-label="Limpar campo"
      color="fg.subtle"
      cursor="pointer"
      display="flex"
      height={CLEAR_TARGET}
      justifyContent="center"
      position="absolute"
      right="7px"
      top="7px"
      transitionProperty="color"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
      width={CLEAR_TARGET}
      zIndex="1"
      onClick={onClick}
    >
      <IconClose size={CLEAR_SIZE} />
    </NativeButton>
  );
}
