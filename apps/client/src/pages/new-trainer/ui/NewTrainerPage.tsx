import { Box, Stack } from '@chakra-ui/react';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';

import { CreateTrainerPanel, GenderToggle, TrainerAvatar, useTrainers } from '~/entities/trainer';
import { useNewTrainerForm } from '~/pages/new-trainer/model/useNewTrainerForm';
import { useStarters } from '~/pages/new-trainer/model/useStarters';
import { useTrainerLimitRedirect } from '~/pages/new-trainer/model/useTrainerLimitRedirect';
import { useAlerts } from '~/shared/ui/alert';
import { BrandLayout } from '~/shared/ui/brand';
import { FormField } from '~/shared/ui/form';
import { Text } from '~/shared/ui/text';

import { NewTrainerActions } from './NewTrainerActions';
import { StarterSection } from './StarterSection';

const GENDER_LABEL = 'Gênero';

export function NewTrainerPage(): ReactElement {
  const navigate = useNavigate();
  const alerts = useAlerts();
  const trainers = useTrainers();
  const starters = useStarters();
  const form = useNewTrainerForm(trainers.create, navigate, alerts.show);

  useTrainerLimitRedirect(trainers.isLoading, trainers.trainers.length, navigate, alerts.show);

  return (
    <BrandLayout>
      <CreateTrainerPanel>
        <form noValidate onSubmit={form.handleSubmit}>
          <Stack gap={6}>
            <TrainerAvatar gender={form.gender} />
            <Box>
              <Text color="fg.muted" marginBlockEnd="1" variant="meta">
                {GENDER_LABEL}
              </Text>
              <GenderToggle value={form.gender} onChange={form.handleGenderChange} />
            </Box>
            <FormField
              autoComplete="name"
              control={form.control}
              label="Nome"
              name="name"
              placeholder="Como você quer ser chamado"
            />
            <StarterSection
              isLoading={starters.isLoading}
              loadError={starters.error}
              selectedId={form.starterId}
              selectionError={form.starterError}
              starters={starters.starters}
              onSelect={form.handleStarterSelect}
            />
            <NewTrainerActions isSubmitting={form.isSubmitting} onBack={form.handleBack} />
          </Stack>
        </form>
      </CreateTrainerPanel>
    </BrandLayout>
  );
}
