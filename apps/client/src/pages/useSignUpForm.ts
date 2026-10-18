import { useState, type ChangeEvent } from 'react';

import { useEmailPasswordForm, type EmailPasswordForm } from '~/pages/useEmailPasswordForm';

export type SignUpFormState = EmailPasswordForm & {
  confirmPassword: string;
  handleConfirmPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function useSignUpForm(): SignUpFormState {
  const base = useEmailPasswordForm();
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  function handleConfirmPasswordChange(event: ChangeEvent<HTMLInputElement>): void {
    setConfirmPassword(event.target.value);
  }

  return {
    ...base,
    confirmPassword,
    handleConfirmPasswordChange,
  };
}
