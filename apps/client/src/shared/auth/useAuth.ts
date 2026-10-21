import { useStore } from 'zustand/react';

import { getAuthStore } from './store/authClient';
import type { AuthResult, AuthStatus, AuthUser, CredentialsInput } from './store/types';

export type AuthSnapshot = {
  isAuthenticated: boolean;
  isLoading: boolean;
  isRecovering: boolean;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  signIn: (input: CredentialsInput) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signOut: () => Promise<void>;
  signUp: (input: CredentialsInput) => Promise<AuthResult>;
  status: AuthStatus;
  updatePassword: (newPassword: string) => Promise<AuthResult>;
  user: AuthUser | null;
};

export function useAuth(): AuthSnapshot {
  const store = getAuthStore();
  const state = useStore(store);
  return {
    isAuthenticated: state.status === 'AUTHENTICATED',
    isLoading: state.status === 'INITIALIZING',
    isRecovering: state.status === 'RECOVERING',
    requestPasswordReset: state.requestPasswordReset,
    signIn: state.signInWithPassword,
    signInWithGoogle: state.signInWithGoogle,
    signOut: state.signOut,
    signUp: state.signUp,
    status: state.status,
    updatePassword: state.updatePassword,
    user: state.user,
  };
}
