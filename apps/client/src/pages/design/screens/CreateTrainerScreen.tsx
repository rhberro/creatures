import { Box } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { TextField } from '~/components/base/field/TextField';
import { Text } from '~/components/base/text/Text';
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

export function CreateTrainerScreen(): ReactElement {
  return (
    <CreateTrainerPanel>
      <TrainerAvatar gender="male" />
      <Field label="Gênero">
        <GenderToggle onChange={noop} value="male" />
      </Field>
      <Field label="Nome">
        <TextField autoComplete="name" name="name" placeholder="Como você quer ser chamado" />
      </Field>
      <Field label="Criatura inicial">
        <StarterGrid onSelect={noop} selectedId="s1" starters={STARTERS} />
      </Field>
    </CreateTrainerPanel>
  );
}

type FieldProps = {
  children: ReactElement;
  label: string;
};

function Field(props: FieldProps): ReactElement {
  const { children, label } = props;
  return (
    <Box>
      <Text color="fg.muted" marginBlockEnd="1" variant="meta">
        {label}
      </Text>
      {children}
    </Box>
  );
}

function noop(): void {
  void 0;
}
