import { expect, test } from 'bun:test';

import {
  emailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
} from '~/features/authentication/model/auth.schema';

const VALID_EMAIL = 'jogador@exemplo.com';
const VALID_PASSWORD = 'senha-suficiente';

test('o e-mail invalido e recusado com a mensagem do campo', checkInvalidEmail);
test('o e-mail e aparado antes de ser conferido', checkTrimmedEmail);
test('a senha curta e recusada com a mensagem do campo', checkShortPassword);
test('a confirmacao que nao bate aponta para o campo da confirmacao', checkMismatchedConfirmation);
test('a confirmacao que bate passa', checkMatchingConfirmation);
test('a senha do login so precisa existir', checkSignInPassword);
test('a recuperacao de senha so pede o e-mail', checkForgotPassword);

function checkInvalidEmail(): void {
  const result = emailSchema.safeParse('nao-e-email');
  expect(result.success).toBe(false);
  expect(result.error?.issues[0]?.message).toBe('Informe um e-mail válido.');
}

function checkTrimmedEmail(): void {
  const result = emailSchema.safeParse(`  ${VALID_EMAIL}  `);
  expect(result.success).toBe(true);
  expect(result.data).toBe(VALID_EMAIL);
}

function checkShortPassword(): void {
  const result = resetPasswordSchema.safeParse({ confirmPassword: 'abc', password: 'abc' });
  expect(result.success).toBe(false);
  expect(result.error?.issues[0]?.message).toBe('A senha deve ter no mínimo 8 caracteres.');
}

function checkMismatchedConfirmation(): void {
  const result = signUpSchema.safeParse({
    confirmPassword: 'outra-senha',
    email: VALID_EMAIL,
    password: VALID_PASSWORD,
  });
  expect(result.success).toBe(false);
  const [issue] = result.error?.issues ?? [];
  expect(issue?.path).toEqual(['confirmPassword']);
  expect(issue?.message).toBe('As senhas não conferem.');
}

function checkMatchingConfirmation(): void {
  const result = signUpSchema.safeParse({
    confirmPassword: VALID_PASSWORD,
    email: VALID_EMAIL,
    password: VALID_PASSWORD,
  });
  expect(result.success).toBe(true);
}

function checkSignInPassword(): void {
  const result = signInSchema.safeParse({ email: VALID_EMAIL, password: 'a' });
  expect(result.success).toBe(true);
}

function checkForgotPassword(): void {
  expect(forgotPasswordSchema.safeParse({ email: VALID_EMAIL }).success).toBe(true);
  expect(forgotPasswordSchema.safeParse({ email: '' }).success).toBe(false);
}
