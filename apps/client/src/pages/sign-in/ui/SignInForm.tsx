import { Stack } from '@chakra-ui/react';
import type { ReactElement } from 'react';

import { AuthUsernameField } from '~/features/authentication';
import { useSignInForm } from '~/pages/sign-in/model/useSignInForm';
import { FormError } from '~/shared/ui/form';

import { SignInActions } from './SignInActions';
import { SignInFields } from './SignInFields';

export function SignInForm(): ReactElement {
  const form = useSignInForm();

  return (
    <form noValidate onSubmit={form.handleSubmit}>
      <Stack gap={4}>
        <AuthUsernameField />
        <SignInFields control={form.control} />
        <FormError message={form.formError} />
        <SignInActions
          isBusy={form.isBusy}
          isOAuthPending={form.isOAuthPending}
          isSubmitting={form.isSubmitting}
          onGoogleClick={form.handleGoogleClick}
        />
      </Stack>
    </form>
  );
}
