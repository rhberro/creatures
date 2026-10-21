import { chakra } from '@chakra-ui/react';
import type { ReactElement, ReactNode } from 'react';

const Label = chakra.label;

type FormLabelProps = {
  children: ReactNode;
  htmlFor?: string;
};

/**
 * O rótulo de um campo.
 *
 * E um `<label>` de verdade: o leitor de tela anuncia o rótulo junto com o
 * campo, e o clique no rótulo leva o foco para o campo.
 */
export function FormLabel(props: FormLabelProps): ReactElement {
  const { children, htmlFor } = props;
  return (
    <Label color="fg.muted" htmlFor={htmlFor} marginBlockEnd="1" textStyle="meta">
      {children}
    </Label>
  );
}
