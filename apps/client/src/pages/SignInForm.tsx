import { Stack } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { SignInActions } from '~/pages/SignInActions';
import { SignInError } from '~/pages/SignInError';
import { SignInFields } from '~/pages/SignInFields';
import { useEmailPasswordForm } from '~/pages/useEmailPasswordForm';
import { useSignInSubmit } from '~/pages/useSignInSubmit';

export function SignInForm(): ReactElement {
  const form = useEmailPasswordForm();
  const submit = useSignInSubmit(form);

  return (
    <form noValidate onSubmit={submit.handleSubmit}>
      <Stack gap={4}>
        <SignInFields
          email={form.email}
          onEmailChange={form.handleEmailChange}
          onPasswordChange={form.handlePasswordChange}
          password={form.password}
        />
        <SignInError message={form.error} />
        <SignInActions isSubmitting={form.isSubmitting} onGoogleClick={submit.handleGoogleClick} />
      </Stack>
    </form>
  );
}
