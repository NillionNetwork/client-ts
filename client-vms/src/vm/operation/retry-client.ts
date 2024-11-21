import { Code, ConnectError } from "@connectrpc/connect";
import { Log } from "@nillion/client-vms/logger";
import { Duration, Effect as E, Schedule, pipe } from "effect";
import { UnknownException } from "effect/Cause";

function isRetryableError(error: unknown): boolean {
  let cause = error;
  if (error instanceof UnknownException && error.cause) {
    cause = error.cause;
  }

  if (cause instanceof ConnectError) {
    return [
      Code.DeadlineExceeded,
      Code.ResourceExhausted,
      Code.Unavailable,
      Code.DataLoss,
    ].includes(cause.code);
  }

  if (cause instanceof Error) {
    return [
      "NetworkError",
      "AbortError",
      "TimeoutError",
      "ERR_NETWORK",
      "ECONNREFUSED",
    ].includes(cause.name);
  }

  return false;
}

function createRetryStrategy<E>(context: string) {
  const maxRetries = 5;
  let attempt = 0;

  const schedule = pipe(
    Schedule.fixed(Duration.seconds(1)),
    Schedule.intersect(Schedule.recurs(maxRetries)),
    Schedule.whileInput((error: unknown) => {
      const recoverable = isRetryableError(error);
      attempt += 1;

      if (recoverable) {
        Log(`${context} failed (attempt ${attempt}/${maxRetries}): %O`, error);
      } else {
        Log(`${context} irrecoverable failure: %O`, error);
      }

      return recoverable;
    }),
  );

  return <R, A>(effect: E.Effect<R, E, A>) => E.retry(effect, schedule);
}

export function retryGrpcRequestIfRecoverable<R>(
  context: string,
  request: E.Effect<R, UnknownException>,
): E.Effect<R, UnknownException> {
  return pipe(
    request,
    createRetryStrategy(context),
    E.tapError((error) =>
      E.sync(() => Log("Retries exhausted. Final error:", error)),
    ),
  );
}
