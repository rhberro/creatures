import { type ChangeEvent, type RefCallback, useRef, useState } from 'react';

import { createInputRefCallback } from './field.ref';
import type { TextFieldInputProps, TextFieldProps } from './field.types';

export type TextFieldState = {
  borderColor: string;
  endPadding: string | undefined;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleClear: () => void;
  hasValue: boolean;
  inputProps: TextFieldInputProps;
  inputRefCallback: RefCallback<HTMLInputElement>;
  shownValue: string | number | readonly string[] | undefined;
};

/**
 * O estado do campo de texto.
 *
 * O campo tem dois estados: o de fora, que e o valor que o dono do campo
 * manda, e o de dentro, que e o valor que o jogador digita. Quando o valor
 * de fora existe, o de dentro nao manda no que aparece na tela.
 *
 * O `ref` do input e do dono do campo — e o React Hook Form que precisa dele
 * para focar o primeiro campo invalido. O `TextField` junta os dois refs
 * porque o React so aceita um por elemento.
 */
export function useTextField(props: TextFieldProps): TextFieldState {
  const {
    clearable = false,
    defaultValue,
    invalid = false,
    onChange,
    ref: externalRef,
    value,
    ...inputProps
  } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const inputRefCallback = useRef<RefCallback<HTMLInputElement> | null>(null);
  if (inputRefCallback.current === null) {
    inputRefCallback.current = createInputRefCallback(inputRef, externalRef);
  }
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<string>(String(defaultValue ?? ''));
  const shownValue = isControlled ? value : innerValue;

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    if (!isControlled) {
      setInnerValue(event.target.value);
    }
    if (onChange) {
      onChange(event);
    }
  }

  function handleClear(): void {
    resetInput(inputRef.current);
    if (!isControlled) {
      setInnerValue('');
    }
  }

  return {
    borderColor: invalid ? 'border.error' : 'border',
    endPadding: clearable ? '36px' : undefined,
    handleChange,
    handleClear,
    hasValue: String(shownValue ?? '').length > 0,
    inputProps,
    inputRefCallback: inputRefCallback.current,
    shownValue,
  };
}

function resetInput(input: HTMLInputElement | null): void {
  if (!input) {
    return;
  }
  NATIVE_VALUE_SETTER?.call(input, '');
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
}

const NATIVE_VALUE_SETTER = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype,
  'value',
)?.set;
