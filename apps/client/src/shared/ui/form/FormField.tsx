import { Field } from '@chakra-ui/react';
import type { ReactElement } from 'react';
import { useController } from 'react-hook-form';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

import { TextField } from '~/shared/ui/field';

import { FORM_ERROR_COLOR, FORM_ERROR_ROLE, FORM_ERROR_TEXT_STYLE } from './form.constants';
import { FormLabel } from './FormLabel';

type FormFieldProps<TValues extends FieldValues> = {
  autoComplete?: string;
  control: Control<TValues>;
  label: string;
  name: FieldPath<TValues>;
  placeholder?: string;
  type?: string;
};

/**
 * O campo do formulario, ligado ao React Hook Form.
 *
 * E o wrapper que o `useController` pede: o valor, o `onChange`, o `onBlur` e
 * o erro saem do hook e chegam no controle. Nao ha `render` function — quem
 * escreve o campo escreve `<FormField name="email" label="E-mail" />`.
 *
 * O `control` e explicito, e nao vem de context: e ele que segura o tipo dos
 * valores do formulario, e com ele o nome do campo e verificado na
 * compilacao. Um nome errado nao compila.
 *
 * O `Field.Root` do Chakra amarra rotulo, controle e mensagem de erro: o
 * `aria-invalid` e o `aria-errormessage` sao preenchidos sozinhos. O erro do
 * campo usa `Field.ErrorText`, que so existe dentro do `Field.Root`. O erro do
 * formulario inteiro — o que nao pertence a um campo — e o `FormError`, que nao
 * depende do contexto do Chakra.
 *
 * O campo com erro tambem tem a borda de erro: o `invalid` que sai daqui
 * troca a borda do `TextField` pela borda vermelha do tema.
 */
export function FormField<TValues extends FieldValues>(
  props: FormFieldProps<TValues>,
): ReactElement {
  const { autoComplete, control, label, name, placeholder, type } = props;
  const { field, fieldState } = useController({ control, name });
  const fieldId = `field-${name}`;
  const fieldValue = String(field.value ?? '');
  const errorMessage = fieldState.error?.message;
  const invalid = errorMessage !== undefined;
  const message = invalid ? (
    <Field.ErrorText
      color={FORM_ERROR_COLOR}
      role={FORM_ERROR_ROLE}
      textStyle={FORM_ERROR_TEXT_STYLE}
    >
      {errorMessage}
    </Field.ErrorText>
  ) : null;
  return (
    <Field.Root invalid={invalid}>
      <FormLabel htmlFor={fieldId}>{label}</FormLabel>
      <TextField
        autoComplete={autoComplete}
        id={fieldId}
        invalid={invalid}
        name={name}
        placeholder={placeholder}
        ref={field.ref}
        type={type}
        value={fieldValue}
        onBlur={field.onBlur}
        onChange={field.onChange}
      />
      {message}
    </Field.Root>
  );
}
