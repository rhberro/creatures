import { requestTrainerList } from '~/trainers/trainerRequests';
import type { TrainerListResult } from '~/trainers/trainerRequests';
import { readAccessToken, readApiBaseUrl } from '~/trainers/useTrainers';

const TRAINERS_PATH = '/trainers';
const NEW_TRAINER_PATH = '/trainers/new';

export function decideDestinationAfterAuth(): Promise<string> {
  const deps = { baseUrl: readApiBaseUrl(), getAccessToken: readAccessToken };
  return requestTrainerList(deps).then(readDestination, readFallbackDestination);
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
