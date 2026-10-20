import type { ReactElement } from 'react';

import { Text } from '~/components/base/text/Text';
import type { TrainerClientErrorCode } from '~/trainers/trainersClient';

export { CreateTrainerCard } from '~/components/domain/trainer/CreateTrainerCard';
export { TrainerList } from '~/components/domain/trainer/TrainerList';

const PAGE_ERROR_MESSAGES: Record<TrainerClientErrorCode, string> = {
  invalid_gender: 'Gênero inválido.',
  invalid_name: 'Nome inválido.',
  invalid_starter: 'A criatura inicial informada é inválida.',
  max_trainers_reached: 'Você atingiu o limite de 5 treinadores.',
  name_taken: 'Nome indisponível.',
  trainer_not_found: 'Treinador não encontrado.',
  unauthenticated: 'Sessão expirada. Entre novamente.',
  unknown: 'Não foi possível carregar os treinadores.',
};

export function PageError(props: PageErrorProps): ReactElement {
  const { code } = props;
  return (
    <Text color="fg.error" textAlign="center" variant="body">
      {PAGE_ERROR_MESSAGES[code]}
    </Text>
  );
}

export type PageErrorProps = {
  code: TrainerClientErrorCode;
};
