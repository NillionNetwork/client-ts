import {
  Compute,
  ComputeRetrieveResult,
  NilVmClient,
  Operation,
  OperationType,
  PaymentReceipt,
  PermissionsRetrieve,
  PermissionsUpdate,
  PriceQuote,
  ProgramStore,
  ValueRetrieve,
  ValuesDelete,
  ValuesStore,
  ValuesUpdate,
} from "@nillion/core";
import { NilChainPaymentClient } from "@nillion/payments";
import { IntoWasmQuotableOperation } from "@nillion/core/src/wasm";
import { Log } from "./logger";

export type FetchQuoteThenPayThenExecuteArgs = {
  operation: Operation;
} & Record<string, unknown>;

export type FetchQuoteThenPayThenExecuteResult<T> =
  | {
      result: T;
    }
  | {
      result: T;
      quote: PriceQuote;
      receipt: PaymentReceipt;
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
  async execute<T = unknown>(
    args: FetchQuoteThenPayThenExecuteArgs,
  ): Promise<FetchQuoteThenPayThenExecuteResult<T>> {
    Log(`executing: ${JSON.stringify(args)}`);

    switch (args.operation.type) {
      case OperationType.enum.ClusterInfoRetrieve: {
        const result = await this.vm.clusterInfoRetrieve();
        return {
          result: result.unwrap() as T,
        };
      }

      case OperationType.enum.Compute: {
        const operation = args.operation as Compute;
        const [quote, receipt] = await this.pay(operation);
        const { bindings, values, storeIds } = operation.args;
        const result = await this.vm.compute(
          receipt,
          bindings,
          storeIds,
          values,
        );
        return {
          quote,
          receipt,
          result: result.unwrap() as unknown as T,
        };
      }

      case OperationType.enum.ComputeRetrieveResult: {
        const operation = args.operation as ComputeRetrieveResult;
        const { id } = operation.args;
        const result = await this.vm.computeResultRetrieve(id);
        return {
          result: result.unwrap() as unknown as T,
        };
      }

      case OperationType.enum.PermissionsRetrieve: {
        const operation = args.operation as PermissionsRetrieve;
        const [quote, receipt] = await this.pay(operation);
        const { id } = operation.args;
        const result = await this.vm.permissionsRetrieve(receipt, id);

        return {
          quote,
          receipt,
          result: result.unwrap() as unknown as T,
        };
      }

      case OperationType.enum.PermissionsUpdate: {
        const operation = args.operation as PermissionsUpdate;
        const [quote, receipt] = await this.pay(operation);
        const { id, permissions } = operation.args;
        const result = await this.vm.permissionsUpdate(
          receipt,
          id,
          permissions,
        );

        return {
          quote,
          receipt,
          result: result.unwrap() as unknown as T,
        };
      }

      case OperationType.enum.ProgramStore: {
        const operation = args.operation as ProgramStore;
        const [quote, receipt] = await this.pay(operation);
        const { name, program } = operation.args;
        const result = await this.vm.programStore(receipt, name, program);
        return {
          quote,
          receipt,
          result: result.unwrap() as unknown as T,
        };
      }

      case OperationType.enum.ValuesDelete: {
        const operation = args.operation as ValuesDelete;
        const { id } = operation.args;
        const result = await this.vm.valueDelete(id);
        return {
          result: result.unwrap() as unknown as T,
        };
      }

      case OperationType.enum.ValueRetrieve: {
        const operation = args.operation as ValueRetrieve;
        const [quote, receipt] = await this.pay(operation);
        const { id, name } = operation.args;
        const result = await this.vm.valueRetrieve(
          receipt,
          id,
          name,
          operation.args.type,
        );

        return {
          quote,
          receipt,
          result: result.unwrap() as unknown as T,
        };
      }

      case OperationType.enum.ValuesStore: {
        const operation = args.operation as ValuesStore;
        const [quote, receipt] = await this.pay(operation);
        const { values, permissions } = operation.args;
        const result = await this.vm.valuesStore(receipt, values, permissions);

        return {
          quote,
          receipt,
          result: result.unwrap() as unknown as T,
        };
      }

      case OperationType.enum.ValuesUpdate: {
        const operation = args.operation as ValuesUpdate;
        const [quote, receipt] = await this.pay(operation);
        const { id, values } = operation.args;

        const result = await this.vm.valuesUpdate(receipt, id, values);

        return {
          quote,
          receipt,
          result: result.unwrap() as unknown as T,
        };
      }

      default: {
        throw `Unknown operation: ${args}`;
      }
    }
  }

  async pay(
    operation: IntoWasmQuotableOperation,
  ): Promise<[PriceQuote, PaymentReceipt]> {
    const quote = (await this.vm.priceQuoteRequest(operation)).unwrap();
    const hash = await this.chain.pay(quote);
    const receipt = PaymentReceipt.parse({
      quote,
      hash,
    });
    return [quote, receipt];
  }

  // // global opts: all as signed, all as secret all as string
  // async createValue(value: number, options: any) {
  //   type Opts = {
  //     secret: true | false; // default true
  //     variant: "unsigned" | "signed" | undefined; // default signed for number-like else undefined
  //     format: number | string | bigint | uint8array; // default number for number-like else uint8array
  //   };
  //
  //   throw "not implemented";
  // }
  //
  // async getPriceQuote() {}
  // async getClusterInfo() {}
  //
  // async getValue(id: string, options: any) {
  //   throw "not implemented";
  // }
  //
  // async updateValue(id: string, options: any) {
  //   throw "not implemented";
  // }
  //
  // async deleteValue(id: string, options: any) {
  //   throw "not implemented";
  // }
  //
  // async retrievePermissions() {}
  //
  // async updatePermissions() {}
  //
  // async runProgram() {}
  //
  // async uploadProgram() {}

  static create(
    nilVm: NilVmClient,
    nilChain: NilChainPaymentClient,
  ): NillionClient {
    return new NillionClient(nilVm, nilChain);
  }
}
