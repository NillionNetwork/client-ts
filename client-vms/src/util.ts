import { Effect as E, pipe } from "effect";
import { UnknownException } from "effect/Cause";
import type { Effect } from "effect/Effect";

export const collapse = <T>(list: T[]): E.Effect<T, UnknownException> => {
  return pipe(
    E.succeed(list),
    E.filterOrFail(
      (ls) => ls.length > 0,
      () => new UnknownException("Empty list"),
    ),
    E.map((ls) => ({
      first: ls[0],
      asStrings: ls.map((e) => JSON.stringify(e)),
    })),
    E.filterOrFail(
      ({ asStrings }) => asStrings.every((str) => str === asStrings[0]),
      () => new UnknownException("Not all elements are equal"),
    ),
    E.map(() => list[0] as T),
  );
};

export function assertIsDefined<T>(
  value: T | null | undefined,
  name?: string,
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(`Expected ${name} to be defined but got ${value}`);
  }
}

export function unwrapExceptionCause(
  error: UnknownException | Error,
): Effect<never, unknown, never> {
  if (error.cause === null || error.cause === undefined) {
    return E.fail(error);
  }
  return E.fail(error.cause);
}
