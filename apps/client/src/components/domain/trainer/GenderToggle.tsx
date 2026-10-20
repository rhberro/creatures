import { Box } from '@chakra-ui/react';
import type { Gender } from '@creatures/contracts/trainer';
import type { ReactElement } from 'react';

import { Text } from '~/components/base/text/Text';

const GENDER_LABELS = {
  female: 'Feminino',
  male: 'Masculino',
} as const;

type GenderToggleProps = {
  onChange: (gender: Gender) => void;
  value: Gender;
};

export function GenderToggle(props: GenderToggleProps): ReactElement {
  const { onChange, value } = props;
  const maleSelected = value === 'male';
  const femaleSelected = value === 'female';
  return (
    <Box
      alignSelf="center"
      bg="bg.sunken"
      borderRadius="sm"
      boxShadow="recessed"
      display="flex"
      gap="1"
      marginInline="auto"
      padding="1"
      width="fit-content"
    >
      <GenderButton gender="male" selected={maleSelected} onSelect={onChange} />
      <GenderButton gender="female" selected={femaleSelected} onSelect={onChange} />
    </Box>
  );
}

type GenderButtonProps = {
  gender: Gender;
  onSelect: (gender: Gender) => void;
  selected: boolean;
};

function GenderButton(props: GenderButtonProps): ReactElement {
  const { gender, onSelect, selected } = props;
  const label = GENDER_LABELS[gender];
  const background = selected ? 'bg.raised' : 'transparent';
  const boxShadow = selected ? 'sm' : 'none';
  const color = selected ? 'fg' : 'fg.muted';

  function handleClick(): void {
    onSelect(gender);
  }

  return (
    <Box
      bg={background}
      borderRadius="xs"
      boxShadow={boxShadow}
      color={color}
      cursor="pointer"
      paddingBlock="2"
      paddingInline="5"
      textAlign="center"
      transitionProperty="background-color, color"
      transitionDuration="150ms"
      transitionTimingFunction="ease-out"
      onClick={handleClick}
    >
      <Text paddingInlineEnd="0.1em" variant="label">
        {label}
      </Text>
    </Box>
  );
}
