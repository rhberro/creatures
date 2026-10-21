import { Stack } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { AuthUsernameField } from '~/features/authentication';
import { useSignUpForm } from '~/pages/sign-up/model/useSignUpForm';
import { FormError } from '~/shared/ui/form';

import { SignUpActions } from './SignUpActions';
import { SignUpFields } from './SignUpFields';

export function SignUpForm(): ReactElement {
  const form = useSignUpForm();

  return (
    <form noValidate onSubmit={form.handleSubmit}>
      <Stack gap={4}>
        <AuthUsernameField />
        <SignUpFields control={form.control} />
        <FormError message={form.formError} />
        <SignUpActions
          isBusy={form.isBusy}
          isOAuthPending={form.isOAuthPending}
          isSubmitting={form.isSubmitting}
          onGoogleClick={form.handleGoogleClick}
        />
      </Stack>
    </form>
  );
}
