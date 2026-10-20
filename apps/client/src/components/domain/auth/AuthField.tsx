import { Box } from '@chakra-ui/react';
import type { ChangeEvent, ReactElement } from 'react';

import { TextField } from '~/components/base/field/TextField';
import { Text } from '~/components/base/text/Text';

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
  const message = error ? <FieldError message={error} /> : null;
  return (
    <Box>
      <Text color="fg.muted" marginBlockEnd="1" variant="meta">
        {label}
      </Text>
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

type FieldErrorProps = {
  message: string;
};

function FieldError(props: FieldErrorProps): ReactElement {
  const { message } = props;
  return (
    <Text color="fg.error" marginBlockStart="1" role="alert" variant="body">
      {message}
    </Text>
  );
}
