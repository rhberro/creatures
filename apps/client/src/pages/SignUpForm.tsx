import { Stack } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { SignInError } from '~/pages/SignInError';
import { SignUpActions } from '~/pages/SignUpActions';
import { SignUpFields } from '~/pages/SignUpFields';
import { useSignUpForm } from '~/pages/useSignUpForm';
import { useSignUpSubmit } from '~/pages/useSignUpSubmit';

export function SignUpForm(): ReactElement {
  const form = useSignUpForm();
  const submit = useSignUpSubmit(form);

  return (
    <form noValidate onSubmit={submit.handleSubmit}>
      <Stack gap={4}>
        <SignUpFields
          confirmPassword={form.confirmPassword}
          email={form.email}
          onConfirmPasswordChange={form.handleConfirmPasswordChange}
          onEmailChange={form.handleEmailChange}
          onPasswordChange={form.handlePasswordChange}
          password={form.password}
        />
        <SignInError message={form.error} />
        <SignUpActions isSubmitting={form.isSubmitting} onGoogleClick={submit.handleGoogleClick} />
      </Stack>
    </form>
  );
}
