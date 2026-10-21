import type { FieldValues, UseFormReturn } from 'react-hook-form';

/**
 * O erro do formulario inteiro.
 *
 * O erro que nao pertence a um campo — "e-mail ou senha invalidos", "as
 * senhas nao conferem" — mora na raiz do estado do React Hook Form, em
 * `root.form`. E assim que o RHF trata erro de formulario: ele nao pertence a
 * nenhum campo, e por isso nao some quando um campo e revalidado.
 *
 * O erro do campo e do campo: ele sai no `FormField`, e some sozinho quando o
 * valor passa a ser valido.
 */
export const FORM_ERROR_KEY = 'root.form';

export function readFormError<TValues extends FieldValues>(form: UseFormReturn<TValues>): string {
  return form.formState.errors.root?.form?.message ?? '';
}

export function writeFormError<TValues extends FieldValues>(
  form: UseFormReturn<TValues>,
  message: string,
): void {
  form.setError(FORM_ERROR_KEY, { message });
}

/**
 * O setter do erro do formulario, pronto para passar para os handlers.
 */
export function buildFormErrorSetter<TValues extends FieldValues>(
  form: UseFormReturn<TValues>,
): (message: string) => void {
  return function setFormError(message: string): void {
    writeFormError(form, message);
  };
}
