export { createApiDeps, readApiBaseUrl } from './client';
export type { ApiDeps } from './client';
export { buildHeaders, isSuccessStatus, resolveErrorCode } from './http';
export type { TrainerClientErrorCode } from './http';
export {
  requestCreateTrainer,
  requestDeleteTrainer,
  requestTrainerList,
  requestUpdateTrainer,
} from './endpoints/trainer';
export type {
  DeleteTrainerResult,
  TrainerCreateResult,
  TrainerListResult,
  TrainerUpdateInput,
  TrainerUpdateResult,
} from './endpoints/trainer';
export { requestStarterList } from './endpoints/starter';
export type { StarterListResult } from './endpoints/starter';
export { requestPlayerState, requestSessionTrainer } from './endpoints/player';
export type { PlayerStateResult, SessionTrainerResult } from './endpoints/player';
export {
  requestClearGear,
  requestEquipAbilities,
  requestEquipGear,
  requestSwapCreature,
} from './endpoints/skill';
export type { SkillCommandResult } from './endpoints/skill';
export { requestGoogleMerge } from './endpoints/auth';
export type { GoogleMergeErrorCode, GoogleMergeResult } from './endpoints/auth';
export { requestHuntArea, requestHuntAreaList } from './endpoints/hunt';
export type { HuntAreaDetailResult, HuntAreaListResult } from './endpoints/hunt';
export { requestStoreBuy, requestStoreCatalog, requestStoreSell } from './endpoints/store';
export type {
  StoreCatalogResult,
  StoreClientErrorCode,
  StoreCommandResult,
  StoreOutcome,
} from './endpoints/store';
