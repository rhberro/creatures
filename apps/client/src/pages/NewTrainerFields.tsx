import { Box, Button, Input, Spinner, Stack, Text } from '@chakra-ui/react';
import type { Gender, Starter } from '@creatures/contracts/trainer';
import type { ChangeEvent, ReactElement } from 'react';

const CREATE_LABEL = 'Criar';
const BACK_LABEL = 'Voltar';
const MALE: Gender = 'male';
const FEMALE: Gender = 'female';
const SELECTED_BORDER_COLOR = 'blue.500';
const DEFAULT_BORDER_COLOR = 'border.default';

const GENDER_LABELS: Record<Gender, string> = {
  female: 'Feminino',
  male: 'Masculino',
};

const AVATAR_SYMBOLS: Record<Gender, string> = {
  female: '♀',
  male: '♂',
};

const AVATAR_COLORS: Record<Gender, string> = {
  female: 'pink.500',
  male: 'blue.500',
};

export function TrainerAvatar(props: TrainerAvatarProps): ReactElement {
  const { gender } = props;
  const symbol = AVATAR_SYMBOLS[gender];
  const color = AVATAR_COLORS[gender];
  return (
    <Box
      alignItems="center"
      alignSelf="center"
      bg={color}
      borderRadius="full"
      boxSize="96px"
      color="white"
      display="flex"
      fontSize="4xl"
      justifyContent="center"
    >
      {symbol}
    </Box>
  );
}

export function GenderToggle(props: GenderToggleProps): ReactElement {
  const { onChange, value } = props;
  const isMaleSelected = value === MALE;
  const isFemaleSelected = value === FEMALE;
  return (
    <Stack direction="row" gap={2}>
      <GenderButton gender={MALE} selected={isMaleSelected} onSelect={onChange} />
      <GenderButton gender={FEMALE} selected={isFemaleSelected} onSelect={onChange} />
    </Stack>
  );
}

export function NameField(props: NameFieldProps): ReactElement {
  const { error, name, onBlur, onChange } = props;
  return (
    <Stack gap={1}>
      <Input
        aria-label="Nome do treinador"
        name="name"
        placeholder="Nome do treinador"
        value={name}
        onBlur={onBlur}
        onChange={onChange}
      />
      <ValidationMessage message={error} />
    </Stack>
  );
}

export function StarterSection(props: StarterSectionProps): ReactElement {
  const { isLoading, onSelect, selectedId, starters } = props;
  if (isLoading) {
    return <Spinner alignSelf="center" color="fg.muted" />;
  }
  const cards = starters.map(buildStarterCardBuilder(onSelect, selectedId));
  return (
    <Stack gap={3}>
      <Text fontWeight="semibold">Criatura Inicial</Text>
      {cards}
    </Stack>
  );
}

export function NewTrainerActions(props: NewTrainerActionsProps): ReactElement {
  const { isCreatable, isSubmitting, onBack } = props;
  const isDisabled = !isCreatable;
  return (
    <Stack direction="row" gap={3}>
      <Button colorPalette="gray" flex={1} variant="outline" onClick={onBack}>
        {BACK_LABEL}
      </Button>
      <Button
        colorPalette="blue"
        disabled={isDisabled}
        flex={1}
        loading={isSubmitting}
        type="submit"
      >
        {CREATE_LABEL}
      </Button>
    </Stack>
  );
}

function GenderButton(props: GenderButtonProps): ReactElement {
  const { gender, onSelect, selected } = props;
  const label = GENDER_LABELS[gender];
  const palette = selected ? 'blue' : 'gray';
  const variant = selected ? 'solid' : 'outline';
  function handleClick(): void {
    onSelect(gender);
  }
  return (
    <Button colorPalette={palette} flex={1} variant={variant} onClick={handleClick}>
      {label}
    </Button>
  );
}

function ValidationMessage(props: ValidationMessageProps): ReactElement | null {
  const { message } = props;
  if (message === null) {
    return null;
  }
  return (
    <Text color="fg.error" fontSize="sm" role="alert">
      {message}
    </Text>
  );
}

function buildStarterCardBuilder(
  onSelect: (id: string) => void,
  selectedId: string | null,
): (starter: Starter) => ReactElement {
  return function buildCard(starter: Starter): ReactElement {
    const isSelected = starter.id === selectedId;
    return (
      <StarterCard key={starter.id} isSelected={isSelected} starter={starter} onSelect={onSelect} />
    );
  };
}

function StarterCard(props: StarterCardProps): ReactElement {
  const { isSelected, onSelect, starter } = props;
  const borderColor = isSelected ? SELECTED_BORDER_COLOR : DEFAULT_BORDER_COLOR;
  function handleClick(): void {
    onSelect(starter.id);
  }
  return (
    <Button
      alignItems="flex-start"
      borderColor={borderColor}
      borderWidth="2px"
      display="flex"
      flexDirection="column"
      gap={1}
      h="auto"
      justifyContent="flex-start"
      p={4}
      textAlign="left"
      variant="outline"
      whiteSpace="normal"
      w="full"
      onClick={handleClick}
    >
      <Text fontWeight="bold">{starter.name}</Text>
      <Text color="fg.muted" fontSize="sm">
        {starter.description}
      </Text>
    </Button>
  );
}

export type TrainerAvatarProps = {
  gender: Gender;
};

export type GenderToggleProps = {
  onChange: (gender: Gender) => void;
  value: Gender;
};

export type NameFieldProps = {
  error: string | null;
  name: string;
  onBlur: () => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export type StarterSectionProps = {
  isLoading: boolean;
  onSelect: (id: string) => void;
  selectedId: string | null;
  starters: Starter[];
};

export type NewTrainerActionsProps = {
  isCreatable: boolean;
  isSubmitting: boolean;
  onBack: () => void;
};

type GenderButtonProps = {
  gender: Gender;
  onSelect: (gender: Gender) => void;
  selected: boolean;
};

type ValidationMessageProps = {
  message: string | null;
};

type StarterCardProps = {
  isSelected: boolean;
  onSelect: (id: string) => void;
  starter: Starter;
};
