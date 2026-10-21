import type { PlayerState } from '@creatures/contracts/player';
import type { ReactElement } from 'react';

import { Toolbar } from '~/widgets/game-hud';

type GameToolbarProps = {
  onOpenBackpack: () => void;
  onOpenStorage: () => void;
  onSignOut: () => void;
  onSwitchTrainer: () => void;
  state: PlayerState;
};

/**
 * The toolbar of the game screen.
 *
 * It shows the trainer and the coins, and it holds the access to the modules
 * of the game.
 */
export function GameToolbar(props: GameToolbarProps): ReactElement {
  const { onOpenBackpack, onOpenStorage, onSignOut, onSwitchTrainer, state } = props;
  const trainer = state.trainer;
  const diamonds = readAmount(state.diamonds, trainer.diamonds);
  const gold = readAmount(state.gold, trainer.gold);
  return (
    <Toolbar
      diamonds={diamonds}
      gold={gold}
      trainerLevel={trainer.level}
      trainerName={trainer.name}
      onOpenBackpack={onOpenBackpack}
      onOpenStorage={onOpenStorage}
      onSignOut={onSignOut}
      onSwitchTrainer={onSwitchTrainer}
    />
  );
}

function readAmount(primary: number | undefined, fallback: number | undefined): number {
  return primary ?? fallback ?? 0;
}
