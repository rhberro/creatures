export { createApiDeps, readApiBaseUrl } from './client';
export type { ApiDeps } from './client';
export { buildHeaders, isSuccessStatus, resolveErrorCode } from './http';
export type { TrainerClientErrorCode } from './http';
export {
  requestCreateTrainer,
  requestDeleteTrainer,
  requestTrainerList,
} from './endpoints/trainer';
export type {
  DeleteTrainerResult,
  TrainerCreateResult,
  TrainerListResult,
} from './endpoints/trainer';
export { requestStarterList } from './endpoints/starter';
export type { StarterListResult } from './endpoints/starter';
