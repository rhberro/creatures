import { useForm } from 'react-hook-form';
import type { Control, FieldValues } from 'react-hook-form';

/**
 * Um formulario sem validacao, so para a galeria.
 *
 * A galeria mostra o componente real do formulario, e o `FormField` do design
 * system esta ligado ao React Hook Form. Aqui o formulario existe sem schema
 * e sem validacao: o que a galeria mostra e a aparencia, e nao o
 * comportamento.
 */
export function useStaticForm(): Control<FieldValues> {
  const { control } = useForm<FieldValues>();
  return control;
}
