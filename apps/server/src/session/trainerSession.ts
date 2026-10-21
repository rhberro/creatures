export type TrainerSessionStore = {
  clear(userId: string): void;
  get(userId: string): string | null;
  getLastSwapAt(userId: string): number | null;
  registerSwap(userId: string, at: number): void;
  set(userId: string, trainerId: string): void;
};

type TrainerSession = {
  lastSwapAt: number | null;
  trainerId: string;
};

/**
 * The active trainer of an account lives on the server, so the client cannot
 * point the server at a trainer that does not belong to it.
 *
 * The session also remembers when the last manual swap happened: the wait of
 * five seconds is a rule of the moment, not a rule of the account, and it does
 * not deserve a place in the database.
 */
export function createTrainerSessionStore(): TrainerSessionStore {
  const sessions = new Map<string, TrainerSession>();

  function clear(userId: string): void {
    sessions.delete(userId);
  }

  function get(userId: string): string | null {
    return sessions.get(userId)?.trainerId ?? null;
  }

  function getLastSwapAt(userId: string): number | null {
    return sessions.get(userId)?.lastSwapAt ?? null;
  }

  function registerSwap(userId: string, at: number): void {
    const session = sessions.get(userId);
    if (session === undefined) {
      return;
    }
    session.lastSwapAt = at;
  }

  function set(userId: string, trainerId: string): void {
    const session = sessions.get(userId);
    if (session !== undefined && session.trainerId === trainerId) {
      return;
    }
    // A different trainer is a different battle: the wait of the previous one
    // does not follow the player.
    sessions.set(userId, { lastSwapAt: null, trainerId });
  }

  return { clear, get, getLastSwapAt, registerSwap, set };
}
