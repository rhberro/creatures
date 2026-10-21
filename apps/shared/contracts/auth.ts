export type AuthStatus = 'AUTHENTICATED' | 'INITIALIZING' | 'RECOVERING' | 'UNAUTHENTICATED';

export type AuthEvent =
  | 'INITIAL_SESSION'
  | 'PASSWORD_RECOVERY'
  | 'SIGNED_IN'
  | 'SIGNED_OUT'
  | 'TOKEN_REFRESHED'
  | 'USER_UPDATED';

export type AuthUser = {
  email: string | null;
  id: string;
  /**
   * The provider of the active identity: `email` for an account created with
   * a password, `google` for an account that entered through Google. It is
   * null when the provider is unknown.
   */
  provider: string | null;
};

export type AuthSession = {
  access_token: string;
  user: AuthUser;
};

export type AuthErrorCode =
  | 'email_already_exists'
  | 'email_confirmation_required'
  | 'invalid_credentials'
  | 'invalid_email'
  | 'invalid_recovery_link'
  | 'network'
  | 'rate_limited'
  | 'same_password'
  | 'unknown'
  | 'weak_password';

export type AuthResult = { ok: true; redirectUrl?: string } | { ok: false; code: AuthErrorCode };

export type AuthAdapterResult = AuthResult;

export type AuthEventHandler = (event: AuthEvent, session: AuthSession | null) => void;

export type CredentialsInput = {
  email: string;
  password: string;
};

/**
 * The signup needs the post-auth route because the confirmation e-mail link
 * lands there, and the link is only allowed to point to an allowed redirect
 * URL of the Supabase project.
 */
export type SignUpInput = {
  email: string;
  password: string;
  path: string;
};

export type OAuthInput = {
  path: string;
  provider: 'google';
};

export type PasswordResetInput = {
  email: string;
  path: string;
};

export type PasswordUpdateInput = {
  password: string;
};

export type AuthAdapter = {
  resetPasswordForEmail(input: PasswordResetInput): Promise<AuthAdapterResult>;
  signInWithOAuth(input: OAuthInput): Promise<AuthAdapterResult>;
  signInWithPassword(input: CredentialsInput): Promise<AuthAdapterResult>;
  signOut(): Promise<void>;
  signUp(input: SignUpInput): Promise<AuthAdapterResult>;
  subscribe(handler: AuthEventHandler): () => void;
  updateUser(input: PasswordUpdateInput): Promise<AuthAdapterResult>;
};

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 64;
