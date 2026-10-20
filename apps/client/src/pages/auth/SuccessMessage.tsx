import type { ReactElement } from 'react';

import { Text } from '~/components/base/text/Text';

const SUCCESS_MESSAGE = 'Senha redefinida com sucesso. Faça login para continuar.';

export function SuccessMessage(): ReactElement {
  return <Text color="fg">{SUCCESS_MESSAGE}</Text>;
}
