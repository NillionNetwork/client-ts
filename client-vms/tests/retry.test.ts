import { Code, ConnectError } from "@connectrpc/connect";
import { retryGrpcRequestIfRecoverable } from "@nillion/client-vms";
import { Effect as E, pipe } from "effect";
import { describe, expect, it } from "vitest";

describe("Client retry", () => {
  it("should retry recoverable errors", async () => {
    let succeedAfter = 3;
    const operation = E.tryPromise(() => {
      if (succeedAfter === 0) {
        return Promise.resolve("success");
      }
      succeedAfter -= 1;
      return Promise.reject(new ConnectError("test", Code.Unavailable));
    });

    const result = await pipe(
      retryGrpcRequestIfRecoverable<string>("it should retry", operation),
      E.runPromise,
    );

    expect(result).toBe("success");
  });

  it("should eventually fail", async () => {
    const operation = E.tryPromise(() =>
      Promise.reject(new ConnectError("test", Code.DataLoss)),
    );

    try {
      await pipe(
        retryGrpcRequestIfRecoverable<string>(
          "it should eventually fail",
          operation,
        ),
        E.runPromise,
      );
      expect(false).toBeTruthy();
    } catch (_error: unknown) {
      expect(true).toBeTruthy();
    }
  });
});
