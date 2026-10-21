import type { RequestContext } from '~/router';

const LIMITED_METHODS = ['DELETE', 'PATCH', 'POST'];
const LIMITED_PREFIXES = ['/api/auth/', '/api/trainers'];

/**
 * The routes the rate limit guards.
 *
 * The guard covers the routes that write the account: the creation, the change
 * and the deletion of a trainer, and the merge of the Google account. The
 * reads are not guarded — the state of the player is read on every command,
 * and a read that is refused breaks the game loop instead of an attack.
 */
export function isRateLimited(method: string, pathname: string): boolean {
  if (!LIMITED_METHODS.includes(method)) {
    return false;
  }
  function startsWithPrefix(prefix: string): boolean {
    return pathname.startsWith(prefix);
  }
  return LIMITED_PREFIXES.some(startsWithPrefix);
}

/**
 * The keys the attempts of a request are counted under.
 *
 * The account is counted by its e-mail, the same way the product counts the
 * sign in attempts, and by the address the request came from. The e-mail comes
 * from the validated token, never from the body of the request.
 */
export function buildRateLimitKeys(ctx: RequestContext): string[] {
  const keys: string[] = [];
  if (ctx.email !== null && ctx.email !== '') {
    keys.push(`email:${ctx.email}`);
  } else if (ctx.userId !== null) {
    keys.push(`account:${ctx.userId}`);
  }
  if (ctx.clientIp !== null && ctx.clientIp !== '') {
    keys.push(`ip:${ctx.clientIp}`);
  }
  return keys;
}
