import { Box, Input } from '@chakra-ui/react';
import { useRef, useState, type ChangeEvent, type ReactElement } from 'react';

import { FOCUS_BORDER } from '~/theme/focus';

import { ClearControl } from './ClearControl';
import type { TextFieldProps } from './field.types';

const NATIVE_VALUE_SETTER = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype,
  'value',
)?.set;

export function TextField(props: TextFieldProps): ReactElement {
  const { clearable = false, defaultValue, onChange, value, ...rest } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const isControlled = value !== undefined;
  const [innerValue, setInnerValue] = useState<string>(String(defaultValue ?? ''));
  const shownValue = isControlled ? value : innerValue;
  const hasValue = String(shownValue ?? '').length > 0;
  const clearControl = clearable && hasValue ? <ClearControl onClick={handleClear} /> : null;
  const endPadding = clearable ? '36px' : undefined;

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

  return (
    <Box position="relative" width="full">
      <Input
        bg="bg.sunken"
        borderColor="border"
        borderRadius="sm"
        color="fg"
        fontSize="md"
        focusRingColor="arcane.500"
        height="38px"
        paddingInlineEnd={endPadding}
        ref={inputRef}
        value={shownValue}
        _focusVisible={FOCUS_BORDER}
        onChange={handleChange}
        {...rest}
      />
      {clearControl}
    </Box>
  );
}

function resetInput(input: HTMLInputElement | null): void {
  if (!input) {
    return;
  }
  NATIVE_VALUE_SETTER?.call(input, '');
  input.dispatchEvent(new window.Event('input', { bubbles: true }));
}
