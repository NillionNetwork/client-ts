import { ExecuteOperationArgs } from "./operation";

export type PriceQuoteRequestArgs = {
  program: Uint8Array;
};

export class PriceQuoteRequest {
  constructor(private args: PriceQuoteRequestArgs) {}

  toString(): string {
    return `Operation(type="PriceQuoteRequest")`;
  }

  async execute(_args: ExecuteOperationArgs): Promise<string> {
    throw "not implemented";
  }
}
