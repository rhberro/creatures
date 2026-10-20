import type { Trainer } from '@creatures/contracts/trainer';
import type { ReactElement } from 'react';

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
  return (
    <TrainersPanel
      isLoading={false}
      selectedId="t1"
      trainers={TRAINERS}
      onCreate={noop}
      onDelete={noop}
      onEnter={noop}
      onSelect={noop}
      onSignOut={noop}
    />
  );
}

function noop(): void {
  void 0;
}
