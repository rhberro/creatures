import type { ReactElement } from 'react';

import { hasStaminaForHunt } from '~/features/hunt-area/model/huntAreaStamina';
import { useHuntCountdown } from '~/features/hunt-area/model/useHuntCountdown';
import { Button } from '~/shared/ui/button';

const START_LABEL = 'Iniciar caçada';
const LOW_STAMINA_LABEL = 'Stamina insuficiente';

type StartHuntButtonProps = {
  onUnavailable: () => void;
  staminaMinutes: number;
};

/**
 * The button that starts the hunt.
 *
 * The wait to enter the area happens in the label of the button, and the
 * button waits for it. The hunt itself does not exist yet, so the wait ends
 * with the notice that tells the player so.
 */
export function StartHuntButton(props: StartHuntButtonProps): ReactElement {
  const { onUnavailable, staminaMinutes } = props;
  const { remaining, start } = useHuntCountdown(onUnavailable);
  const hasStamina = hasStaminaForHunt(staminaMinutes);
  const label = readLabel(hasStamina, remaining);
  const disabled = !hasStamina || remaining !== null;
  return (
    <Button disabled={disabled} tone="primary" width="full" onClick={start}>
      {label}
    </Button>
  );
}

function readLabel(hasStamina: boolean, remaining: number | null): string {
  if (!hasStamina) {
    return LOW_STAMINA_LABEL;
  }
  if (remaining === null) {
    return START_LABEL;
  }
  return `Entrando na caçada em ${remaining}`;
}
