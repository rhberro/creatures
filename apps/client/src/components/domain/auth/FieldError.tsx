import { Field } from '@chakra-ui/react';
import type { ReactElement } from 'react';

type FieldErrorProps = {
  message: string;
};

/**
 * A mensagem de erro de um campo.
 *
 * E o `Field.ErrorText` do Chakra: o id dela entra no `aria-describedby` do
 * controle, entao o leitor de tela le o erro junto com o campo.
 */
export function FieldError(props: FieldErrorProps): ReactElement {
  const { message } = props;
  return (
    <Field.ErrorText color="fg.error" role="alert" textStyle="body">
      {message}
    </Field.ErrorText>
  );
}
