import type { ComponentProps, Ref } from 'react';

export type TextFieldProps = Omit<
  ComponentProps<typeof import('@chakra-ui/react').Input>,
  'children' | 'ref'
> & {
  clearable?: boolean;
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
};

/**
 * As props que vao para o `Input`.
 *
 * O que o `useTextField` consume — o valor, o `onChange`, o `ref`, o
 * `clearable` e o `invalid` — nao vai para o `Input`: o valor e o `onChange`
 * sao do estado do campo, e o `ref` e do React Hook Form.
 */
export type TextFieldInputProps = Omit<
  TextFieldProps,
  'clearable' | 'defaultValue' | 'invalid' | 'onChange' | 'ref' | 'value'
>;
