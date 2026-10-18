import type { AuthErrorCode } from '~/auth/store/types';

const NETWORK_STATUS = 0;

const RECOVERY_LINK_CODES = new Set<string>([
  'bad_recovery_token',
  'otp_expired',
  'session_expired',
  'refresh_token_not_found',
  'refresh_token_already_used',
  'flow_state_expired',
  'flow_state_not_found',
]);

type ErrorShape = {
  code?: unknown;
  message?: unknown;
  status?: unknown;
};

export function mapAuthError(error: unknown): AuthErrorCode {
  const shape = readErrorShape(error);
  if (shape === null) {
    return 'unknown';
  }
  return mapCode(shape);
}

function readErrorShape(error: unknown): ErrorShape | null {
  if (typeof error !== 'object' || error === null) {
    return null;
  }
  const shape: ErrorShape = {};
  if ('code' in error) {
    shape.code = error.code;
  }
  if ('message' in error) {
    shape.message = error.message;
  }
  if ('status' in error) {
    shape.status = error.status;
  }
  return shape;
}

function mapCode(error: ErrorShape): AuthErrorCode {
  const code = readString(error.code);
  if (code === null) {
    return classifyByStatus(error.status);
  }
  switch (code) {
    case 'email_exists':
    case 'user_already_exists':
      return 'email_already_exists';
    case 'email_not_confirmed':
      return 'invalid_credentials';
    case 'invalid_credentials':
      return 'invalid_credentials';
    case 'over_email_send_rate_limit':
    case 'over_request_rate_limit':
    case 'over_sms_send_rate_limit':
      return 'rate_limited';
    case 'same_password':
      return 'same_password';
    case 'validation_failed':
      return classifyValidation(error);
    case 'weak_password':
      return 'weak_password';
    default:
      return classifyRecoveryCode(code);
  }
}

function classifyRecoveryCode(code: string): AuthErrorCode {
  if (RECOVERY_LINK_CODES.has(code)) {
    return 'invalid_recovery_link';
  }
  return 'unknown';
}

function classifyByStatus(status: unknown): AuthErrorCode {
  if (status === NETWORK_STATUS) {
    return 'network';
  }
  return 'unknown';
}

function classifyValidation(error: ErrorShape): AuthErrorCode {
  const message = readString(error.message);
  if (message === null) {
    return 'invalid_email';
  }
  const normalized = message.toLowerCase();
  if (normalized.includes('email') || normalized.includes('password')) {
    return 'weak_password';
  }
  if (normalized.includes('rate')) {
    return 'rate_limited';
  }
  return 'invalid_email';
}

function readString(value: unknown): string | null {
  if (typeof value === 'string') {
    return value;
  }
  return null;
}
