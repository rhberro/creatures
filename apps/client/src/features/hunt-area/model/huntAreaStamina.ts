/**
 * The minimum stamina to start a hunt.
 *
 * The trainer can hunt with less stamina than this: the rule stops the start
 * of the hunt, not its continuity.
 */
export const MINIMUM_STAMINA_MINUTES = 30;

export function hasStaminaForHunt(staminaMinutes: number): boolean {
  return staminaMinutes >= MINIMUM_STAMINA_MINUTES;
}
