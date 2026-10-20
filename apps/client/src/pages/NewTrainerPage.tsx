import { Box, Stack } from '@chakra-ui/react';
import type { Gender, NewTrainerInput } from '@creatures/contracts/trainer';
import type { FormEvent } from 'react';
import { createElement, useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { ReactElement } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import type { AlertInput } from '~/components/base/alert/alert.types';
import { useAlerts } from '~/components/base/alert/useAlerts';
import { Text } from '~/components/base/text/Text';
import { FieldLabel } from '~/components/domain/auth/FieldLabel';
import { BrandLayout } from '~/components/domain/brand/BrandLayout';
import { CreateTrainerPanel } from '~/components/domain/trainer/CreateTrainerPanel';
import { GenderToggle } from '~/components/domain/trainer/GenderToggle';
import { TrainerAvatar } from '~/components/domain/trainer/TrainerAvatar';
import { NameField } from '~/pages/trainer/NameField';
import { NewTrainerActions } from '~/pages/trainer/NewTrainerActions';
import { StarterSection } from '~/pages/trainer/StarterSection';
import type { TrainerClientErrorCode, TrainerCreateResult } from '~/trainers/trainersClient';
import { useStarters } from '~/trainers/useStarters';
import { useTrainers } from '~/trainers/useTrainers';
import { newTrainerSchema } from '~/validation/trainer';

const TRAINERS_PATH = '/trainers';
const MAX_TRAINERS = 5;
const ALERT_DURATION_MS = 6000;
const LIMIT_MESSAGE = 'Você atingiu o limite de 5 treinadores.';
const EMPTY_NAME = '';
const DEFAULT_GENDER: Gender = 'male';

const CREATE_ERROR_MESSAGES: Record<TrainerClientErrorCode, string> = {
  invalid_gender: 'Gênero inválido.',
  invalid_name: 'Nome inválido.',
  invalid_starter: 'A criatura inicial informada é inválida.',
  max_trainers_reached: 'Você atingiu o limite de 5 treinadores.',
  name_taken: 'Nome indisponível.',
  trainer_not_found: 'Treinador não encontrado.',
  unauthenticated: 'Sessão expirada. Entre novamente.',
  unknown: 'Não foi possível criar o treinador.',
};

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
              <FieldLabel>Gênero</FieldLabel>
              <GenderToggle value={form.gender} onChange={form.handleGenderChange} />
            </Box>
            <NameField
              error={form.nameError}
              name={form.name}
              onBlur={form.handleNameBlur}
              onChange={form.handleNameChange}
            />
            <StarterSection
              error={starters.error}
              isLoading={starters.isLoading}
              selectedId={form.starterId}
              starters={starters.starters}
              onSelect={form.handleStarterSelect}
            />
            <NewTrainerActions
              isCreatable={form.isCreatable}
              isSubmitting={form.isSubmitting}
              onBack={form.handleBack}
            />
          </Stack>
        </form>
      </CreateTrainerPanel>
    </BrandLayout>
  );
}

type NewTrainerForm = {
  gender: Gender;
  isCreatable: boolean;
  isSubmitting: boolean;
  name: string;
  nameError: string | null;
  starterId: string | null;
  handleBack: () => void;
  handleGenderChange: (gender: Gender) => void;
  handleNameBlur: () => void;
  handleNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handleStarterSelect: (id: string) => void;
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

type SubmitDeps = {
  create: (input: NewTrainerInput) => Promise<TrainerCreateResult>;
  gender: Gender;
  isCreatable: boolean;
  name: string;
  navigate: NavigateFunction;
  setIsSubmitting: (value: boolean) => void;
  show: (input: AlertInput) => string;
  starterId: string | null;
};

function useNewTrainerForm(
  create: (input: NewTrainerInput) => Promise<TrainerCreateResult>,
  navigate: NavigateFunction,
  show: (input: AlertInput) => string,
): NewTrainerForm {
  const [gender, setGender] = useState<Gender>(DEFAULT_GENDER);
  const [name, setName] = useState(EMPTY_NAME);
  const [starterId, setStarterId] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameError = touched ? readNameError(name) : null;
  const isCreatable = nameError === null && starterId !== null && !isSubmitting;

  return {
    gender,
    handleBack: buildBackHandler(navigate),
    handleGenderChange: setGender,
    handleNameBlur: buildNameBlurHandler(setTouched),
    handleNameChange: buildNameChangeHandler(setName, setTouched),
    handleStarterSelect: setStarterId,
    handleSubmit: buildSubmitHandler({
      create,
      gender,
      isCreatable,
      name,
      navigate,
      setIsSubmitting,
      show,
      starterId,
    }),
    isCreatable,
    isSubmitting,
    name,
    nameError,
    starterId,
  };
}

function buildSubmitHandler(deps: SubmitDeps): (event: FormEvent<HTMLFormElement>) => void {
  return function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const { create, gender, isCreatable, name, navigate, setIsSubmitting, show, starterId } = deps;
    if (!isCreatable || starterId === null) {
      return;
    }
    setIsSubmitting(true);
    create({ gender, name: name.trim(), starterCreatureId: starterId }).then(
      buildCreateHandler(navigate, show, setIsSubmitting),
      buildFailureHandler(show, setIsSubmitting),
    );
  };
}

function buildBackHandler(navigate: NavigateFunction): () => void {
  return function handleBack(): void {
    navigate(TRAINERS_PATH);
  };
}

function buildNameChangeHandler(
  setName: (value: string) => void,
  setTouched: (value: boolean) => void,
): (event: ChangeEvent<HTMLInputElement>) => void {
  return function handleNameChange(event: ChangeEvent<HTMLInputElement>): void {
    setName(event.target.value);
    setTouched(true);
  };
}

function buildNameBlurHandler(setTouched: (value: boolean) => void): () => void {
  return function handleNameBlur(): void {
    setTouched(true);
  };
}

function readNameError(name: string): string | null {
  const result = newTrainerSchema.shape.name.safeParse(name);
  if (result.success) {
    return null;
  }
  const [issue] = result.error.issues;
  return issue?.message ?? null;
}

function buildCreateHandler(
  navigate: NavigateFunction,
  show: (input: AlertInput) => string,
  setIsSubmitting: (value: boolean) => void,
): (result: TrainerCreateResult) => void {
  return function handleCreate(result: TrainerCreateResult): void {
    setIsSubmitting(false);
    if (result.ok) {
      navigate(TRAINERS_PATH, { replace: true });
      return;
    }
    show(buildAlertInput(CREATE_ERROR_MESSAGES[result.code]));
  };
}

function buildFailureHandler(
  show: (input: AlertInput) => string,
  setIsSubmitting: (value: boolean) => void,
): (error: unknown) => void {
  return function handleFailure(): void {
    setIsSubmitting(false);
    show(buildAlertInput(CREATE_ERROR_MESSAGES.unknown));
  };
}

function buildAlertInput(message: string): AlertInput {
  return { content: createElement(Text, null, message), duration: ALERT_DURATION_MS, icon: null };
}

function useTrainerLimitRedirect(
  isLoading: boolean,
  count: number,
  navigate: NavigateFunction,
  show: (input: AlertInput) => string,
): void {
  const isLimitReached = !isLoading && count >= MAX_TRAINERS;
  useEffect(buildLimitEffect(isLimitReached, navigate, show), [isLimitReached]);
}

function buildLimitEffect(
  isLimitReached: boolean,
  navigate: NavigateFunction,
  show: (input: AlertInput) => string,
): () => void {
  return function redirectAtLimit(): void {
    if (!isLimitReached) {
      return;
    }
    show(buildAlertInput(LIMIT_MESSAGE));
    navigate(TRAINERS_PATH, { replace: true });
  };
}
