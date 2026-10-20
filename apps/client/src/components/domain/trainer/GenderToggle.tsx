import { Box } from '@chakra-ui/react';
import type { Gender } from '@creatures/contracts/trainer';
import { useRef, type KeyboardEvent, type ReactElement, type RefObject } from 'react';

import { NativeButton } from '~/components/base/button/NativeButton';
import { Text } from '~/components/base/text/Text';
import { FOCUS_RING } from '~/theme/focus';

import { GENDERS, GENDER_LABELS } from './genderToggle.constants';

type GenderToggleProps = {
  onChange: (gender: Gender) => void;
  value: Gender;
};

type GenderButtons = Record<string, HTMLDivElement | null>;

export function GenderToggle(props: GenderToggleProps): ReactElement {
  const { onChange, value } = props;
  const buttonsRef = useRef<GenderButtons>({});
  const options = GENDERS.map(renderOption(value, onChange, buttonsRef));

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    const step = readStep(event.key);
    if (step === null) {
      return;
    }
    event.preventDefault();
    const index = GENDERS.indexOf(value);
    const next = GENDERS[(index + step + GENDERS.length) % GENDERS.length];
    onChange(next);
    buttonsRef.current[next]?.focus();
  }

  return (
    <Box
      alignSelf="center"
      aria-label="Gênero"
      bg="bg.sunken"
      borderRadius="sm"
      boxShadow="recessed"
      display="flex"
      gap="1"
      marginInline="auto"
      padding="1"
      role="radiogroup"
      width="fit-content"
      onKeyDown={handleKeyDown}
    >
      {options}
    </Box>
  );
}

function readStep(key: string): number | null {
  if (key === 'ArrowRight' || key === 'ArrowDown') {
    return 1;
  }
  if (key === 'ArrowLeft' || key === 'ArrowUp') {
    return -1;
  }
  return null;
}

function renderOption(
  value: Gender,
  onChange: (gender: Gender) => void,
  buttonsRef: RefObject<GenderButtons>,
): (gender: Gender) => ReactElement {
  return function render(gender: Gender): ReactElement {
    const onRef = buildRefSetter(buttonsRef, gender);
    const isSelected = gender === value;
    return (
      <GenderButton
        key={gender}
        gender={gender}
        selected={isSelected}
        onChange={onChange}
        onRef={onRef}
      />
    );
  };
}

function buildRefSetter(
  buttonsRef: RefObject<GenderButtons>,
  gender: Gender,
): (node: HTMLDivElement | null) => void {
  return function setRef(node: HTMLDivElement | null): void {
    buttonsRef.current[gender] = node;
  };
}

type GenderButtonProps = {
  gender: Gender;
  onChange: (gender: Gender) => void;
  onRef: (node: HTMLDivElement | null) => void;
  selected: boolean;
};

function GenderButton(props: GenderButtonProps): ReactElement {
  const { gender, onChange, onRef, selected } = props;
  const label = GENDER_LABELS[gender];
  const background = selected ? 'bg.raised' : 'transparent';
  const boxShadow = selected ? 'sm' : 'none';
  const color = selected ? 'fg' : 'fg.muted';
  const tabIndex = selected ? 0 : -1;

  function handleClick(): void {
    onChange(gender);
  }

  return (
    <NativeButton
      _focusVisible={FOCUS_RING}
      aria-checked={selected}
      bg={background}
      borderRadius="xs"
      boxShadow={boxShadow}
      color={color}
      cursor="pointer"
      paddingBlock="2"
      paddingInline="5"
      ref={onRef}
      role="radio"
      tabIndex={tabIndex}
      textAlign="center"
      transitionProperty="background-color, color"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
      onClick={handleClick}
    >
      <Text paddingInlineEnd="0.1em" variant="label">
        {label}
      </Text>
    </NativeButton>
  );
}
