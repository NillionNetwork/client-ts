import { Effect as E, pipe } from "effect";
import { ZodError } from "zod";
import { isTaggedError } from "./error";

export type Result<S, E> = { ok: S; err: null } | { ok: null; err: E };

export const effectToResultAsync = <S, E extends Error>(
  effect: E.Effect<S, E>,
): Promise<Result<S, E>> => {
  return pipe(
    effect,
    E.match({
      onSuccess: (ok) => ({ ok, err: null }),
      onFailure: (err) => unwindError<S, E>(err),
    }),
    E.runPromise,
  );
};

export const effectToResultSync = <S, E extends Error>(
  effect: E.Effect<S, E>,
): Result<S, E> => {
  return pipe(
    effect,
    E.match({
      onSuccess: (ok) => ({ ok, err: null }),
      onFailure: (err) => unwindError<S, E>(err),
    }),
    E.runSync,
  );
};

const unwindError = <S, E extends Error>(
  err: unknown,
): Result<S, E> | never => {
  // If the error is untagged then its unexpected
  if (isTaggedError(err)) {
    const root = findRootErrorCause(err as Error);

    if (root instanceof ZodError) {
      console.error("Operation failed with parsing error:", root.message);
      console.error("Stack trace: ", root.stack);
    } else {
      console.error("Operation failed with root error: ", root.message);
      console.error("Stack trace: ", root.stack);
    }

    return { err: root as E, ok: null };
  }
  console.error(err);
  throw err;
};

const findRootErrorCause = (err: Error): Error => {
  // these error stacks are shallow so recursion depth is minimal
  const { cause } = err;
  if (!(cause instanceof Error)) {
    return err;
  } else {
    return findRootErrorCause(cause);
  }
};
