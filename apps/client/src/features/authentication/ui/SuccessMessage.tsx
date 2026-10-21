import type { ReactElement } from 'react';

import { Text } from '~/shared/ui/text';

const SUCCESS_MESSAGE = 'Senha redefinida com sucesso. Faça login para continuar.';

export function SuccessMessage(): ReactElement {
  return <Text color="fg">{SUCCESS_MESSAGE}</Text>;
}
