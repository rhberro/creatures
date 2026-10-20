import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { Button } from '~/components/base/button/Button';
import { TextField } from '~/components/base/field/TextField';
import { FieldLabel } from '~/components/domain/auth/FieldLabel';
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
        <FieldLabel>Gênero</FieldLabel>
        <GenderToggle onChange={noop} value="male" />
      </Box>
      <Box>
        <FieldLabel>Nome</FieldLabel>
        <TextField autoComplete="name" name="name" placeholder="Como você quer ser chamado" />
      </Box>
      <Box>
        <FieldLabel>Criatura inicial</FieldLabel>
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
