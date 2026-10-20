import type { ChangeEvent, ReactElement } from 'react';

import { AuthField } from '~/components/domain/auth/AuthField';

type NameFieldProps = {
  error: null | string;
  name: string;
  onBlur: (event: ChangeEvent<HTMLInputElement>) => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function NameField(props: NameFieldProps): ReactElement {
  const { error, name, onBlur, onChange } = props;
  const message = error ?? undefined;
  return (
    <AuthField
      autoComplete="name"
      error={message}
      label="Nome"
      name="name"
      onBlur={onBlur}
      onChange={onChange}
      placeholder="Como você quer ser chamado"
      value={name}
    />
  );
}
