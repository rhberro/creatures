/**
 * A command of the panel that is on its way to the server.
 */
type CommandTask = () => Promise<void>;

let commandChain: Promise<void> = Promise.resolve();

/**
 * The commands of the panel go out one at a time, in the order the player
 * made them.
 *
 * The server replaces the loadout with the one the command carries: two
 * commands that cross on the way would leave the bar with the loadout of the
 * first one, and the second choice would be lost. The chain makes the second
 * command leave only after the first one lands.
 */
export function dispatchCommand(task: CommandTask): void {
  commandChain = commandChain.then(task, task);
}

/**
 * The moment when every command that was sent has landed.
 */
export function whenCommandsSettled(): Promise<void> {
  return commandChain;
}
