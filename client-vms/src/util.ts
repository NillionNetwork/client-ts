import { Effect as E, pipe } from "effect";
import { UnknownException } from "effect/Cause";

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
