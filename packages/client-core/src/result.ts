import { Effect as E, pipe } from "effect";
import { ZodError } from "zod";

import { isTaggedError } from "./error";

/**
 * The outcome of a failable operation. This type represents either a successful result or an error.
 *
 * - If the operation was successful, `result.ok` contains the success value, and `result.err` is `null`.
 * - If the operation failed, `result.err` contains the error value, and `result.ok` is `null`.
 *
 * @typeParam S - The type of the success value. This represents the data or result produced by the operation if it succeeds.
 * @typeParam E - The type of the error value. This represents the error or exception encountered by the operation if it fails.
 *
 * @example
 * ```ts
 * declare result: Result<StoreId, Error>
 * if(result.err) {
 *    const err = result.err // err has type Error
 *    console.log("the operation failed: ", result.err.message)
 *    return
 * }
 * const id = result.ok // id has type StoreId
 * ```
 */
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
