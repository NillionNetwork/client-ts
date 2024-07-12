import {
  ExecuteResult,
  NilVmClient,
  Operation,
  PaymentReceipt,
} from "@nillion/core";
import { NilChainPaymentClient } from "@nillion/payments/src/client";
import { Log } from "@nillion/payments/src/logger";

export type FetchQuoteThenPayThenExecuteArgs = {
  operation: Operation;
} & Record<string, unknown>;

export type FetchQuoteThenPayThenExecuteResult = {
  quote: unknown;
  receipt: PaymentReceipt;
  result: ExecuteResult;
};

export class NillionClient {
  private constructor(
    private vm: NilVmClient,
    private chain: NilChainPaymentClient,
  ) {}

  /**
   * Fetches a quote, pays and then executes the operation
   */
  // TODO(tim): expose correct arg types for operation
  async execute(
    args: FetchQuoteThenPayThenExecuteArgs,
  ): Promise<FetchQuoteThenPayThenExecuteResult> {
    const { operation, ...rest } = args;
    const quote = await this.vm.fetchQuote(operation);

    Log(`quote: ${quote.cost.total}unil for ${operation.type}`);

    const hash = await this.chain.pay(quote);
    const receipt = PaymentReceipt.parse({ quote, hash, wasm: quote.inner });

    const result = await this.vm.execute({
      operation,
      receipt,
      ...rest,
    });

    return {
      quote,
      receipt,
      result,
    };
  }

  static create(
    nilVm: NilVmClient,
    nilChain: NilChainPaymentClient,
  ): NillionClient {
    return new NillionClient(nilVm, nilChain);
  }
}
