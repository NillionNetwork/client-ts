import { TaggedError } from "@nillion/client-core";

export class AccountNotFoundError extends Error implements TaggedError {
  readonly _tag = "AccountNotFoundError" as const;

  constructor(account: string, cause?: unknown) {
    const message = `Account ${account} not found or it has no funds.`;
    super(message, { cause });
    this.name = "AccountNotFoundError";
  }
}

export class UnknownPaymentError extends Error {
  readonly _tag = "UnknownPaymentError" as const;

  constructor(cause?: unknown) {
    super("UnknownPaymentError", { cause });
    this.name = "UnknownPaymentError";
  }
}

export type PaymentError = AccountNotFoundError | UnknownPaymentError;
