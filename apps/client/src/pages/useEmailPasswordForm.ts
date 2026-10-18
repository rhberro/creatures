import { useState, type ChangeEvent } from 'react';

export type EmailPasswordForm = {
  email: string;
  error: string;
  isSubmitting: boolean;
  password: string;
  handleEmailChange: (event: ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (event: ChangeEvent<HTMLInputElement>) => void;
  setError: (message: string) => void;
  setIsSubmitting: (value: boolean) => void;
};

export function useEmailPasswordForm(): EmailPasswordForm {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  function handleEmailChange(event: ChangeEvent<HTMLInputElement>): void {
    setEmail(event.target.value);
  }

  function handlePasswordChange(event: ChangeEvent<HTMLInputElement>): void {
    setPassword(event.target.value);
  }

  return {
    email,
    error,
    handleEmailChange,
    handlePasswordChange,
    isSubmitting,
    password,
    setError,
    setIsSubmitting,
  };
}
