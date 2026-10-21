import type { Ref, RefCallback, RefObject } from 'react';

export type RefHolder<T> = {
  current: Ref<T> | undefined;
};

/**
 * O callback que junta o ref de fora com o no do input.
 *
 * O `TextField` precisa do no para limpar o campo, e o React Hook Form precisa
 * do ref para focar o primeiro campo invalido. O React so aceita um ref por
 * elemento, entao os dois passam por aqui.
 *
 * O ref de fora e lido na primeira renderizacao: e o que o React Hook Form
 * entrega, e ele nao muda de identidade.
 */
export function createInputRefCallback(
  inputRef: RefObject<HTMLInputElement | null>,
  externalRef: Ref<HTMLInputElement> | undefined,
): RefCallback<HTMLInputElement> {
  return function assignInputRef(node: HTMLInputElement | null): void {
    inputRef.current = node;
    assignRef(externalRef, node);
  };
}

export function assignRef<T>(ref: Ref<T> | undefined, node: T | null): void {
  if (typeof ref === 'function') {
    ref(node);
    return;
  }
  if (ref) {
    ref.current = node;
  }
}
