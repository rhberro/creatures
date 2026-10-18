import { useState, type ChangeEvent } from 'react';

import { useEmailPasswordForm, type EmailPasswordForm } from '~/pages/useEmailPasswordForm';

export type PasswordResetFormState = Omit<EmailPasswordForm, 'email' | 'handleEmailChange'> & {
  confirmPassword: string;
  handleConfirmPasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export function usePasswordResetForm(): PasswordResetFormState {
  const base = useEmailPasswordForm();
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  function handleConfirmPasswordChange(event: ChangeEvent<HTMLInputElement>): void {
    setConfirmPassword(event.target.value);
  }

  return {
    confirmPassword,
    error: base.error,
    handleConfirmPasswordChange,
    handlePasswordChange: base.handlePasswordChange,
    isSubmitting: base.isSubmitting,
    password: base.password,
    setError: base.setError,
    setIsSubmitting: base.setIsSubmitting,
  };
}
