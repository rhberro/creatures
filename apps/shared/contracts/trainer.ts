export type Gender = 'male' | 'female';

export type NewTrainerInput = {
  name: string;
  gender: Gender;
  starterCreatureId: string;
};

export type Trainer = {
  id: string;
  name: string;
  gender: Gender;
  level: number;
  starterCreatureId: string;
  createdAt: string;
};

export type Starter = {
  description: string;
  id: string;
  name: string;
};

export type TrainerErrorCode =
  | 'invalid_name'
  | 'invalid_gender'
  | 'invalid_starter'
  | 'name_taken'
  | 'max_trainers_reached'
  | 'trainer_not_found'
  | 'unauthenticated';
