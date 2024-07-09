import * as Wasm from "@nillion/client-wasm";
import { Log } from "./logger";
import {
  ClusterId,
  Multiaddr,
  PartyId,
  PaymentReceipt,
  PriceQuote,
  StoreId,
} from "@nillion/types";
import { Operation, OperationType } from "./operation";
import { NadaValue, NadaValues, NadaValueType, toTypedNadaValue } from "./nada";

export type NilVmClientArgs = {
  bootnodes: Multiaddr[];
  clusterId: ClusterId;
  // TODO(tim): support key + generate options
  userSeed: string;
  nodeSeed: string;
};

export class NilVmClient {
  constructor(
    public clusterId: ClusterId,
    public client: Wasm.NillionClient,
  ) {}

  public get partyId(): PartyId {
    return this.client.party_id;
  }

  async fetchQuote(operation: Operation): Promise<PriceQuote> {
    Log(`fetch quote for: ${operation.toString()}`);
    const wasmOperation = operation.toWasm();

    const quote = await this.client.request_price_quote(
      this.clusterId,
      wasmOperation,
    );

    return PriceQuote.parse({
      expires: quote.expires_at,
      nonce: quote.nonce,
      cost: {
        base: quote.cost.base_fee,
        compute: quote.cost.compute_fee,
        congestion: quote.cost.congestion_fee,
        preprocessing: quote.cost.preprocessing_fee,
        total: quote.cost.total,
      },
      inner: quote,
    });
  }

  async execute(args: OperationExecuteArgs): Promise<unknown> {
    switch (args.operation.type) {
      case OperationType.enum.StoreValues:
        return await this.storeValues(args);
      case OperationType.enum.RetrieveValue:
        return await this.retrieveValue(args as OperationArgsValueRetrieve);
      default:
        throw `Operation not implemented: ${args.operation.type}`;
    }
  }

  async storeValues(args: OperationArgsValuesStore): Promise<StoreId> {
    const { receipt, operation, permissions } = args;
    const values = operation.values.toWasm();
    const wasmReceipt = new Wasm.PaymentReceipt(
      receipt.quote.inner as Wasm.PriceQuote,
      receipt.hash,
    );

    const result = await this.client.store_values(
      this.clusterId,
      values,
      permissions,
      wasmReceipt,
    );

    return StoreId.parse(result);
  }

  async retrieveValue(args: OperationArgsValueRetrieve): Promise<NadaValue> {
    const { receipt, storeId, valueId, type } = args;
    const wasmReceipt = new Wasm.PaymentReceipt(
      receipt.quote.inner as Wasm.PriceQuote,
      receipt.hash,
    );

    const wasmNadaValue = await this.client.retrieve_value(
      this.clusterId,
      storeId,
      valueId,
      wasmReceipt,
    );

    return toTypedNadaValue(type, wasmNadaValue);
  }

  static create(args: NilVmClientArgs): NilVmClient {
    const userKey = Wasm.UserKey.from_seed(args.userSeed);
    const nodeKey = Wasm.NodeKey.from_seed(args.nodeSeed);
    const nilvm = new Wasm.NillionClient(userKey, nodeKey, args.bootnodes);

    return new NilVmClient(args.clusterId, nilvm);
  }
}

export type OperationExecuteArgs = {
  receipt: PaymentReceipt;
  operation: Operation;
} & Record<string, unknown>;

export type OperationArgsValuesStore = OperationExecuteArgs & {
  permissions?: Wasm.Permissions;
};

export type OperationArgsValueRetrieve = OperationExecuteArgs & {
  storeId: StoreId;
  valueId: string;
  type: NadaValueType;
};
