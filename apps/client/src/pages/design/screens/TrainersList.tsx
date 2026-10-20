import type { Trainer } from '@creatures/contracts/trainer';
import { useState, type ReactElement } from 'react';

import { TrainerDeleteDialog } from '~/components/domain/trainer/TrainerDeleteDialog';
import { TrainersPanel } from '~/components/domain/trainer/TrainersPanel';

const TRAINERS: Trainer[] = [
  {
    createdAt: '2026-01-01',
    gender: 'male',
    id: 't1',
    level: 12,
    name: 'Rafael',
    starterCreatureId: 'c1',
  },
  {
    createdAt: '2026-01-01',
    gender: 'female',
    id: 't2',
    level: 4,
    name: 'Kael',
    starterCreatureId: 'c2',
  },
  {
    createdAt: '2026-01-01',
    gender: 'male',
    id: 't3',
    level: 7,
    name: 'Mira',
    starterCreatureId: 'c3',
  },
];

export function TrainersList(): ReactElement {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>('t1');
  const pendingName = findTrainerName(TRAINERS, pendingDeleteId);
  const isDialogOpen = pendingDeleteId !== null;
  const panel = (
    <TrainersPanel
      isLoading={false}
      selectedId="t1"
      trainers={TRAINERS}
      onCreate={noop}
      onDelete={setPendingDeleteId}
      onEnter={noop}
      onSelect={noop}
      onSignOut={noop}
    />
  );
  const cancelDelete = handleCancel(setPendingDeleteId);
  const dialog = (
    <TrainerDeleteDialog
      isOpen={isDialogOpen}
      trainerName={pendingName}
      onCancel={cancelDelete}
      onConfirm={noop}
    />
  );
  return (
    <>
      {panel}
      {dialog}
    </>
  );
}

function handleCancel(setPendingDeleteId: (id: string | null) => void): () => void {
  return function cancel(): void {
    setPendingDeleteId(null);
  };
}

function findTrainerName(trainers: Trainer[], pendingDeleteId: string | null): string {
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

function noop(): void {
  void 0;
}
