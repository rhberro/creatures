import { Popover } from '@chakra-ui/react';
import { cloneElement, type ReactElement } from 'react';

import type { PopupProps } from './popup.types';
import { usePopupState } from './usePopupState';

/**
 * O popup.
 *
 * E o `Popover` do Chakra (Ark UI): o conteudo e posicionado com
 * floating-ui — vira e evita sair da tela —, fecha pelo ESC, pelo clique fora
 * e devolve o foco ao gatilho.
 *
 * O que e nosso e o **comportamento**: abre no hover e fica fixado no
 * clique. O hover so existe em ponteiro fino; no toque, o popup abre pelo
 * clique.
 */
export function Popup(props: PopupProps): ReactElement {
  const { children, content } = props;
  const { handleMouseEnter, handleMouseLeave, handleOpenChange, isOpen } = usePopupState();
  const trigger = buildTrigger(children, handleMouseEnter, handleMouseLeave);
  const positioning = buildPositioning();

  return (
    <Popover.Root
      autoFocus={false}
      closeOnInteractOutside
      onOpenChange={handleOpenChange}
      open={isOpen}
      positioning={positioning}
    >
      <Popover.Trigger asChild>{trigger}</Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content
          bg="bg.panel"
          borderColor="border.emphasized"
          borderRadius="sm"
          borderWidth="1px"
          boxShadow="overlay"
          maxW="calc(100vw - 32px)"
          padding="3"
          width="240px"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {content}
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  );
}

function buildTrigger(
  children: ReactElement,
  onMouseEnter: () => void,
  onMouseLeave: () => void,
): ReactElement {
  return cloneElement(children as ReactElement<Record<string, unknown>>, {
    onMouseEnter,
    onMouseLeave,
  });
}

function buildPositioning(): { placement: 'bottom-start' } {
  return { placement: 'bottom-start' };
}
