import { Effect as E, pipe } from "effect";

export type Result<S, E> = { ok: S; err: null } | { ok: null; err: E };

export const effectToResultAsync = <S, E>(
  effect: E.Effect<S, E>,
): Promise<Result<S, E>> => {
  return pipe(
    effect,
    E.match({
      onSuccess: (ok) => ({ ok, err: null }),
      onFailure: (err) => ({ err, ok: null }),
    }),
    E.runPromise,
  );
};

export const effectToResultSync = <S, E>(
  effect: E.Effect<S, E>,
): Result<S, E> => {
  return pipe(
    effect,
    E.match({
      onSuccess: (ok) => ({ ok, err: null }),
      onFailure: (err) => ({ err, ok: null }),
    }),
    E.runSync,
  );
};
