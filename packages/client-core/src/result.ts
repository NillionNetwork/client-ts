import { Effect as E, pipe } from "effect";
import { isTaggedError, TaggedError } from "./error";

export type Result<S, E> = { ok: S; err: null } | { ok: null; err: E };

export const effectToResultAsync = <S, E>(
  effect: E.Effect<S, E>,
): Promise<Result<S, E>> => {
  return pipe(
    effect,
    E.match({
      onSuccess: (ok) => ({ ok, err: null }),
      onFailure: (e) => {
        if (!isTaggedError(e)) {
          console.error(e);
          E.die(e);
        }
        const error = e as TaggedError;
        const message = isTaggedError(error.cause)
          ? error.cause.message
          : error.message;
        console.error("Operation failed: ", message);
        return { err: error.cause, ok: null } as Result<S, E>;
      },
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
