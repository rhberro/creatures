import { createApiDeps, requestTrainerList } from '~/shared/api';
import type { TrainerListResult } from '~/shared/api';
import { getAccessToken } from '~/shared/auth';

const TRAINERS_PATH = '/trainers';
const NEW_TRAINER_PATH = '/trainers/new';

export function decideDestinationAfterAuth(): Promise<string> {
  return requestTrainerList(createApiDeps(getAccessToken)).then(
    readDestination,
    readFallbackDestination,
  );
}

function readDestination(result: TrainerListResult): string {
  if (!result.ok) {
    return TRAINERS_PATH;
  }
  return result.trainers.length === 0 ? NEW_TRAINER_PATH : TRAINERS_PATH;
}

function readFallbackDestination(): string {
  return TRAINERS_PATH;
}
