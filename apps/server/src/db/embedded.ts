/**
 * A joined resource arrives as an object when the relation is a single row.
 * The database is the authority on the shape, so both forms are accepted.
 */
export function readEmbedded<T>(value: T | T[] | null): T | null {
  if (value === null) {
    return null;
  }
  if (Array.isArray(value)) {
    const [first] = value as T[];
    return first ?? null;
  }
  return value as T;
}
