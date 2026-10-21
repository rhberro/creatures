import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { DefaultValues, FieldValues, UseFormReturn } from 'react-hook-form';
import type { ZodType } from 'zod';

/**
 * O formulario com a politica de validacao do projeto.
 *
 * Todo formulario do cliente nasce aqui: o `zodResolver` e o schema, e a
 * politica de quando validar. A politica e uma so, e e esta:
 *
 * - `onTouched`: o campo so e validado depois que o jogador saiu dele uma
 *   vez. Ate la, o erro nao aparece — ninguem precisa ver "e-mail invalido" no
 *   primeiro caractere digitado.
 * - `onChange` na revalidacao: depois do primeiro erro, o campo se atualiza a
 *   cada tecla, e o erro sai no instante em que o jogador corrige.
 * - `onChange` depois do envio: com o formulario ja enviado, qualquer mudanca
 *   revalida na hora.
 *
 * O `onTouched` dispara no primeiro `blur` e, a partir dai, o `onChange` vem
 * junto: o primeiro `blur` mostra o erro, e a digitacao seguinte o mantem em
 * dia.
 *
 * O schema entra com o mesmo tipo de entrada e de saida: o `zodResolver` usa
 * o tipo de saida do schema como o tipo dos valores do formulario, e e por
 * isso que o `control` leva o tipo do formulario inteiro.
 */
export function useZodForm<TValues extends FieldValues>(
  schema: ZodType<TValues, TValues>,
  defaultValues: DefaultValues<TValues>,
): UseFormReturn<TValues, unknown, TValues> {
  const resolver = zodResolver<TValues, unknown, TValues, ZodType<TValues, TValues>>(schema);
  return useForm<TValues, unknown, TValues>({
    defaultValues,
    mode: 'onTouched',
    reValidateMode: 'onChange',
    resolver,
  });
}
