import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Button } from '~/components/base/button/Button';
import { Text } from '~/components/base/text/Text';
import { AuthField } from '~/components/domain/auth/AuthField';
import { CreateTrainerPanel } from '~/components/domain/trainer/CreateTrainerPanel';
import { GenderToggle } from '~/components/domain/trainer/GenderToggle';
import { StarterGrid } from '~/components/domain/trainer/StarterGrid';
import type { StarterEntry } from '~/components/domain/trainer/trainer.types';
import { TrainerAvatar } from '~/components/domain/trainer/TrainerAvatar';

const STARTERS: StarterEntry[] = [
  { id: 's1', name: 'Cinzarra' },
  { id: 's2', name: 'Brotus' },
  { id: 's3', name: 'Pedrino' },
];

const CREATE_LABEL = 'Criar';
const BACK_LABEL = 'Voltar';

export function CreateTrainerScreen(): ReactElement {
  return (
    <CreateTrainerPanel>
      <TrainerAvatar gender="male" />
      <Box>
        <Text color="fg.muted" marginBlockEnd="1" variant="meta">
          Gênero
        </Text>
        <GenderToggle onChange={noop} value="male" />
      </Box>
      <AuthField
        autoComplete="name"
        label="Nome"
        name="name"
        placeholder="Como você quer ser chamado"
      />
      <Box>
        <Text color="fg.muted" marginBlockEnd="1" variant="meta">
          Criatura inicial
        </Text>
        <StarterGrid onSelect={noop} selectedId="s1" starters={STARTERS} />
      </Box>
      <Box display="flex" flexDirection="column" gap="2">
        <Button tone="primary">{CREATE_LABEL}</Button>
        <Button tone="secondary">{BACK_LABEL}</Button>
      </Box>
    </CreateTrainerPanel>
  );
}

function noop(): void {
  void 0;
}
