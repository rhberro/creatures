import type { FormEvent, ReactElement, ReactNode } from 'react';

import { TextField } from '~/shared/ui/field';

type AuthFormProps = {
  children: ReactNode;
};

export function AuthForm(props: AuthFormProps): ReactElement {
  const { children } = props;
  return (
    <form onSubmit={preventSubmit}>
      <TextField
        autoComplete="username"
        display="none"
        name="username"
        readOnly
        value="creatures"
      />
      {children}
    </form>
  );
}

function preventSubmit(event: FormEvent<HTMLFormElement>): void {
  event.preventDefault();
}
