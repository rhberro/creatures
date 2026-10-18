import type { Gender, NewTrainerInput, TrainerErrorCode } from '@creatures/contracts/trainer';
import { z } from 'zod';

import { isValidStarterId } from '~/validation/starters';

const GENDERS: [Gender, Gender] = ['male', 'female'];
const NAME_MIN_LENGTH = 3;
const NAME_MAX_LENGTH = 15;
const NAME_PATTERN = /^[\p{L}\p{N} _-]+$/u;
const DIACRITICS_PATTERN = /[\u0300-\u036F]/gu;

const FIELD_ERROR_CODES: Record<string, TrainerErrorCode> = {
  gender: 'invalid_gender',
  name: 'invalid_name',
  starterCreatureId: 'invalid_starter',
};

const ERROR_MESSAGES: Record<TrainerErrorCode, string> = {
  invalid_gender: 'O gênero deve ser "male" ou "female".',
  invalid_name:
    'O nome deve ter entre 3 e 15 caracteres e usar apenas letras, números, espaços, traços ou underscores.',
  invalid_starter: 'A criatura inicial informada é inválida.',
  max_trainers_reached: 'A conta já atingiu o limite de 5 treinadores.',
  name_taken: 'Já existe um treinador com esse nome.',
  trainer_not_found: 'Treinador não encontrado.',
  unauthenticated: 'Token inválido ou ausente.',
};

export type TrainerValidation =
  | { ok: true; value: NewTrainerInput }
  | { ok: false; code: TrainerErrorCode; message: string };

export const newTrainerRequestSchema = z.object({
  gender: z.enum(GENDERS) satisfies z.ZodType<Gender>,
  name: z.string().trim().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH).regex(NAME_PATTERN),
  starterCreatureId: z.string().uuid(),
}) satisfies z.ZodType<NewTrainerInput>;

export function validateNewTrainer(body: unknown): TrainerValidation {
  const result = newTrainerRequestSchema.safeParse(body);
  if (!result.success) {
    const [issue] = result.error.issues;
    const code = issue === undefined ? 'invalid_name' : readIssueCode(issue);
    return { code, message: readTrainerErrorMessage(code), ok: false };
  }
  if (!isValidStarterId(result.data.starterCreatureId)) {
    return {
      code: 'invalid_starter',
      message: readTrainerErrorMessage('invalid_starter'),
      ok: false,
    };
  }
  return { ok: true, value: result.data };
}

export function readTrainerErrorMessage(code: TrainerErrorCode): string {
  return ERROR_MESSAGES[code];
}

export function normalizeTrainerName(name: string): string {
  return name.normalize('NFD').replace(DIACRITICS_PATTERN, '').toLowerCase();
}

function readIssueCode(issue: z.ZodIssue): TrainerErrorCode {
  const [field] = issue.path;
  if (typeof field !== 'string') {
    return 'invalid_name';
  }
  return FIELD_ERROR_CODES[field] ?? 'invalid_name';
}
