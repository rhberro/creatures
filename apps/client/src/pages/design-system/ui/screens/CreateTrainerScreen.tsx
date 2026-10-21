import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { CreateTrainerPanel, GenderToggle, StarterGrid, TrainerAvatar } from '~/entities/trainer';
import type { StarterEntry } from '~/entities/trainer';
import { useStaticForm } from '~/pages/design-system/model/useStaticForm';
import { Button } from '~/shared/ui/button';
import { FormField } from '~/shared/ui/form';
import { Text } from '~/shared/ui/text';

const STARTERS: StarterEntry[] = [
  { id: 's1', name: 'Cinzarra' },
  { id: 's2', name: 'Brotus' },
  { id: 's3', name: 'Pedrino' },
];

const CREATE_LABEL = 'Criar';
const BACK_LABEL = 'Voltar';

export function CreateTrainerScreen(): ReactElement {
  const control = useStaticForm();
  return (
    <CreateTrainerPanel>
      <TrainerAvatar gender="male" />
      <Box>
        <Text color="fg.muted" marginBlockEnd="1" variant="meta">
          Gênero
        </Text>
        <GenderToggle onChange={noop} value="male" />
      </Box>
      <FormField
        autoComplete="name"
        control={control}
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
