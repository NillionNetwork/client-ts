import { Result } from "@nillion/core";

export const expectOk = <S, E>(
  result: Result<S, E>,
): result is { ok: NonNullable<S>; err: null } => {
  if (result.ok != null && result.err === null) {
    expect(result.ok).toBeDefined();
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  fail("Result.ok expected but got Result.err: " + result.err);
};

export const expectErr = <S, E>(
  result: Result<S, E>,
): result is { ok: null; err: NonNullable<E> } => {
  if (result.err != null && result.ok === null) {
    expect(result.err).toBeDefined();
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  fail("Result.err expected but got Result.ok: " + result.ok);
};
