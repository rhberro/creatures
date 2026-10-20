import { chakra } from '@chakra-ui/react';
import type { ComponentProps, ReactElement } from 'react';

const StyledButton = chakra('button');

export type NativeButtonProps = ComponentProps<typeof StyledButton>;

/**
 * Botão de verdade.
 *
 * Um `Box` com `role="button"` parece um botão, mas não é: ele não responde a
 * Enter nem a Espaço, não some do foco quando desabilitado, e o leitor de tela
 * anuncia uma div. Todo controle clicável do sistema passa por aqui, e o
 * comportamento de teclado vem de graça do elemento nativo.
 */
export function NativeButton(props: NativeButtonProps): ReactElement {
  const { children, ...rest } = props;
  return (
    <StyledButton
      bg="transparent"
      border="none"
      color="inherit"
      font="inherit"
      padding="0"
      textAlign="start"
      type="button"
      {...rest}
    >
      {children}
    </StyledButton>
  );
}
