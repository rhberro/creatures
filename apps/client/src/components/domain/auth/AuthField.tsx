import { Field } from '@chakra-ui/react';
import type { ChangeEvent, ReactElement } from 'react';

import { TextField } from '~/components/base/field/TextField';

import { FieldError } from './FieldError';
import { FieldLabel } from './FieldLabel';

type AuthFieldProps = {
  autoComplete?: string;
  error?: string;
  label: string;
  name: string;
  onBlur?: (event: ChangeEvent<HTMLInputElement>) => void;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  value?: string;
};

/**
 * Campo com rótulo, valor e erro.
 *
 * O `Field.Root` do Chakra amarra rotulo, controle e mensagem de erro: o
 * `aria-invalid` e o `aria-describedby` sao preenchidos sozinhos. O rotulo
 * aponta para o campo pelo `htmlFor`, e o erro entra na descricao do campo.
 */
export function AuthField(props: AuthFieldProps): ReactElement {
  const {
    autoComplete = 'off',
    error,
    label,
    name,
    onBlur,
    onChange,
    placeholder,
    type,
    value,
  } = props;
  const fieldId = `field-${name}`;
  const message = error ? <FieldError message={error} /> : null;
  const invalid = Boolean(error);
  return (
    <Field.Root invalid={invalid}>
      <FieldLabel htmlFor={fieldId}>{label}</FieldLabel>
      <TextField
        autoComplete={autoComplete}
        id={fieldId}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {message}
    </Field.Root>
  );
}
