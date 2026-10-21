import type { AuthStatus, AuthUser } from '@creatures/contracts/auth';

export type {
  AuthAdapter,
  AuthAdapterResult,
  AuthErrorCode,
  AuthEvent,
  AuthEventHandler,
  AuthResult,
  AuthSession,
  AuthStatus,
  AuthUser,
  CredentialsInput,
  OAuthInput,
  PasswordResetInput,
  PasswordUpdateInput,
  SignUpInput,
} from '@creatures/contracts/auth';
export { PASSWORD_MAX, PASSWORD_MIN } from '@creatures/contracts/auth';

export type AuthState = {
  status: AuthStatus;
  user: AuthUser | null;
};
