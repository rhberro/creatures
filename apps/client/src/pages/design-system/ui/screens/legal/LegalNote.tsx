import type { ReactElement } from 'react';

import { Text } from '~/shared/ui/text';

type LegalNoteProps = {
  label: string;
};

export function LegalNote(props: LegalNoteProps): ReactElement {
  const { label } = props;
  const subject = label.toLowerCase();
  return (
    <Text color="fg.muted" variant="body">
      Este documento descreve os {subject} de uso do Creatures. O texto definitivo ainda não foi
      escrito, e o que está aqui é apenas a estrutura do documento.
    </Text>
  );
}
