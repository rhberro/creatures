import type { Gender, NewTrainerInput } from '@creatures/contracts/trainer';
import { z } from 'zod';

const GENDERS: [Gender, Gender] = ['male', 'female'];
const NAME_PATTERN = /^[\p{L}\p{N} _-]+$/u;
const CONSECUTIVE_SPACES_PATTERN = / {2,}/u;
const NAME_LENGTH_MESSAGE = 'O nome deve ter entre 3 e 15 caracteres.';
const NAME_CHARS_MESSAGE =
  'Apenas caracteres simples, espaços, traços e underscores são permitidos.';

export const newTrainerSchema = z.object({
  gender: z.enum(GENDERS) satisfies z.ZodType<Gender>,
  name: z
    .string()
    .trim()
    .min(3, NAME_LENGTH_MESSAGE)
    .max(15, NAME_LENGTH_MESSAGE)
    .regex(NAME_PATTERN, NAME_CHARS_MESSAGE)
    .refine(hasNoConsecutiveSpaces, NAME_CHARS_MESSAGE),
  starterCreatureId: z.string().uuid(),
}) satisfies z.ZodType<NewTrainerInput>;

export type NewTrainerValidation = z.infer<typeof newTrainerSchema>;

function hasNoConsecutiveSpaces(value: string): boolean {
  return !CONSECUTIVE_SPACES_PATTERN.test(value);
}
