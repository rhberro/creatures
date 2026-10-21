import type { ReactElement } from 'react';

import { Text } from '~/shared/ui/text';

import { FORM_ERROR_COLOR, FORM_ERROR_ROLE, FORM_ERROR_TEXT_STYLE } from './form.constants';

type FormErrorProps = {
  message: string;
};

/**
 * A mensagem de erro do formulario.
 *
 * E o erro que nao pertence a um campo: "e-mail ou senha invalidos",
 * "as senhas nao conferem". Nao usa `Field.ErrorText` do Chakra, porque
 * aquele componente so existe dentro de um `Field.Root` e estoura o contexto
 * quando e renderizado sozinho.
 */
export function FormError(props: FormErrorProps): ReactElement | null {
  const { message } = props;
  if (message === '') {
    return null;
  }
  return (
    <Text color={FORM_ERROR_COLOR} role={FORM_ERROR_ROLE} textStyle={FORM_ERROR_TEXT_STYLE}>
      {message}
    </Text>
  );
}
