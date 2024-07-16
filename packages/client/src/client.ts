import {
  ActionId,
  ClusterDescriptor,
  ComputeResultId,
  Days,
  NadaValue,
  NadaValues,
  NadaValueType,
  NadaWrappedValue,
  NilVmClient,
  Operation,
  PaymentReceipt,
  Permissions,
  PriceQuote,
  ProgramBindings,
  ProgramId,
  ProgramName,
  StoreId,
  ValueName,
} from "@nillion/core";
import { NilChainPaymentClient } from "@nillion/payments";
import { IntoWasmQuotableOperation } from "@nillion/core/src/wasm";

export type PaidOperationResult<T, U = Error> = {
  quote: PriceQuote;
  receipt: PaymentReceipt;
  data: T;
};

export class NillionClient {
  defaults = {
    valueTtl: Days.parse(30),
  };

  private constructor(
    private vm: NilVmClient,
    private chain: NilChainPaymentClient,
  ) {}

  async pay(args: {
    operation: IntoWasmQuotableOperation;
  }): Promise<[PriceQuote, PaymentReceipt]> {
    const quote = (await this.vm.priceQuoteRequest(args)).unwrap();
    const hash = await this.chain.pay(quote);
    const receipt = PaymentReceipt.parse({
      quote,
      hash,
    });
    return [quote, receipt];
  }

  async compute(args: {
    bindings: ProgramBindings;
    values: NadaValues;
    storeIds: StoreId[];
  }): Promise<PaidOperationResult<ComputeResultId>> {
    const operation = Operation.compute(args);
    const [quote, receipt] = await this.pay({ operation });
    const result = await this.vm.compute({ receipt, operation });
    const data = result.unwrap();
    return {
      quote,
      receipt,
      data,
    };
  }

  async fetchComputeResult<
    T extends Map<string, NadaWrappedValue> = Map<string, NadaWrappedValue>,
  >(args: { id: ComputeResultId }): Promise<T> {
    const operation = Operation.fetchComputeResult(args);
    const result = await this.vm.computeResultRetrieve(operation.args);
    return result.unwrap() as unknown as T;
  }

  async deleteValues(args: { id: StoreId | string }): Promise<StoreId> {
    const parsed = StoreId.parse(args.id);
    const result = await this.vm.valuesDelete({ id: parsed });
    return result.unwrap();
  }

  async fetchClusterInfo(): Promise<ClusterDescriptor> {
    const result = await this.vm.clusterInfoRetrieve();
    return result.unwrap();
  }

  async fetchValue<T = unknown>(args: {
    id: StoreId | string;
    name: ValueName | string;
    type: NadaValueType;
  }): Promise<PaidOperationResult<T>> {
    const parsedId = StoreId.parse(args.id);
    const parsedName = ValueName.parse(args.name);

    const operation = Operation.fetchValue({
      id: parsedId,
      name: parsedName,
      type: args.type,
    });
    const [quote, receipt] = await this.pay({ operation });

    const result = await this.vm.valueRetrieve({
      receipt,
      operation,
    });

    const data = result.unwrap().data as unknown as T;

    return {
      quote,
      receipt,
      data,
    };
  }

  async storeProgram(args: {
    name: ProgramName;
    program: Uint8Array;
  }): Promise<PaidOperationResult<ProgramId>> {
    const operation = Operation.storeProgram(args);
    const [quote, receipt] = await this.pay({ operation });
    const result = await this.vm.programStore({ receipt, operation });
    const data = result.unwrap();

    return {
      quote,
      receipt,
      data,
    };
  }

  async storeValues(args: {
    values:
      | NadaValues
      | { name: NadaValue | string; value: NadaWrappedValue }[];
    ttl?: Days;
    permissions?: Permissions;
  }): Promise<PaidOperationResult<StoreId>> {
    let values = args.values;
    if (Array.isArray(values)) {
      const asNadaValues = NadaValues.create();
      values.forEach(({ name, value }) => {
        const parsedNamed = ValueName.parse(name);
        if (value instanceof Uint8Array) {
          asNadaValues.insert(parsedNamed, NadaValue.createBlobSecret(value));
        } else if (typeof value === "boolean") {
          asNadaValues.insert(
            parsedNamed,
            NadaValue.createBooleanSecret(value),
          );
        } else if (typeof value === "number") {
          asNadaValues.insert(
            parsedNamed,
            NadaValue.createIntegerSecret(value),
          );
        } else if (typeof value === "bigint") {
          asNadaValues.insert(
            parsedNamed,
            NadaValue.createIntegerSecretUnsigned(value),
          );
        } else {
          throw `unknown value type: ${typeof value}`;
        }
      });
      values = asNadaValues;
    }

    const operation = Operation.storeValues({
      values,
      ttl: args.ttl ?? this.defaults.valueTtl,
      permissions: args.permissions,
    });
    const [quote, receipt] = await this.pay({ operation });
    const result = await this.vm.valuesStore({ receipt, operation });
    const data = result.unwrap();

    return {
      quote,
      receipt,
      data,
    };
  }

  async updateValue(args: {
    id: StoreId;
    values: NadaValues;
    ttl: Days;
  }): Promise<PaidOperationResult<ActionId>> {
    const operation = Operation.updateValues(args);
    const [quote, receipt] = await this.pay({ operation });
    const result = await this.vm.valuesUpdate({ receipt, operation });
    const data = result.unwrap();

    return {
      quote,
      receipt,
      data,
    };
  }

  async fetchPermissions(args: {
    id: StoreId;
  }): Promise<PaidOperationResult<unknown>> {
    const operation = Operation.fetchPermissions(args);
    const [quote, receipt] = await this.pay({ operation });
    const result = await this.vm.permissionsRetrieve({ receipt, operation });
    const data = result.unwrap();
    return {
      quote,
      receipt,
      data,
    };
  }

  async setPermissions(args: {
    id: StoreId;
    permissions: Permissions;
  }): Promise<PaidOperationResult<ActionId>> {
    const operation = Operation.setPermissions(args);
    const [quote, receipt] = await this.pay({ operation });
    const result = await this.vm.permissionsUpdate({ receipt, operation });
    const data = result.unwrap();
    return {
      quote,
      receipt,
      data,
    };
  }

  static create(
    nilVm: NilVmClient,
    nilChain: NilChainPaymentClient,
  ): NillionClient {
    return new NillionClient(nilVm, nilChain);
  }
}
