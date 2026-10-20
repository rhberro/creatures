import { Box } from '@chakra-ui/react';
import type { ChangeEvent, ReactElement } from 'react';

import { TextField } from '~/components/base/field/TextField';
import { Text } from '~/components/base/text/Text';

import { FieldLabel } from './FieldLabel';

type AuthFieldProps = {
  autoComplete?: string;
  error?: string;
  label: string;
  name: string;
  onBlur?: (event: ChangeEvent<HTMLInputElement>) => void;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  value?: string;
};

export function AuthField(props: AuthFieldProps): ReactElement {
  const {
    autoComplete = 'off',
    error,
    label,
    name,
    onBlur,
    onChange,
    placeholder,
    type,
    value,
  } = props;
  const message = error ? <FieldErrorMessage message={error} /> : null;
  return (
    <Box>
      <FieldLabel>{label}</FieldLabel>
      <TextField
        autoComplete={autoComplete}
        name={name}
        onBlur={onBlur}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        value={value}
      />
      {message}
    </Box>
  );
}

type FieldErrorMessageProps = {
  message: string;
};

function FieldErrorMessage(props: FieldErrorMessageProps): ReactElement {
  const { message } = props;
  return (
    <Text color="fg.error" role="alert" variant="body">
      {message}
    </Text>
  );
}
