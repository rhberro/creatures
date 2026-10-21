import type { Trainer } from '@creatures/contracts/trainer';

/**
 * The name of the trainer whose deletion is waiting for confirmation.
 */
export function findTrainerName(trainers: Trainer[], pendingDeleteId: string | null): string {
  if (pendingDeleteId === null) {
    return '';
  }
  const trainer = trainers.find(matchesId(pendingDeleteId));
  return trainer?.name ?? '';
}

function matchesId(id: string): (trainer: Trainer) => boolean {
  return function matches(trainer: Trainer): boolean {
    return trainer.id === id;
  };
}
