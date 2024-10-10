import { Effect as E } from "effect";
import { UnknownException } from "effect/Cause";
import { z } from "zod";

import {
  ActionId,
  ClusterDescriptor,
  ClusterId,
  Compute,
  ComputeOutputId,
  FetchStoreAcl,
  FetchValue,
  init,
  IntoWasmQuotableOperation,
  Multiaddr,
  NadaPrimitiveValue,
  NadaValue,
  OperationType,
  PartyId,
  PaymentReceipt,
  paymentReceiptInto,
  PriceQuote,
  priceQuoteFrom,
  ProgramId,
  SetStoreAcl,
  StoreAcl,
  StoreId,
  StoreProgram,
  StoreValue,
  UpdateValue,
  UserId,
} from "@nillion/client-core";
import * as Wasm from "@nillion/client-wasm";

import { Log } from "../logger";

/* `NilVmClientConfig` is an object that contains the configuration for the NilVmClient
 * @param bootnodes - `Multiaddr[]`
 * @param clusterId - `ClusterId`
 * @param userSeed - `string`
 */
export const NilVmClientConfig = z.object({
  bootnodes: z.array(Multiaddr),
  clusterId: ClusterId,
  userSeed: z.string(),
  nodeSeed: z.string(),
});

export type NilVmClientConfig = z.infer<typeof NilVmClientConfig>;

/**
 * `NilVmClient` is a class that allows you to interact with Nillion.
 */
export class NilVmClient {
  // The wasm bundle is loaded asynchronously which can be problematic because most environments don't
  // support top-level awaits. To manage this complexity `this._client` is lazily initialized and guarded
  // by `isReadyGuard`. Users can therefore create the client in one place and then connect when they are
  // inside an async context.
  // @ts-expect-error lazily loaded on `connect()`, wrapped by `isReadyGuard()` and public access via getter
  private _client: Wasm.NillionClient;
  private _ready = false;

  private constructor(private _config: NilVmClientConfig) {}

  /** `ready` is a boolean that indicates whether the client is ready to be used */
  get ready(): boolean {
    return this._ready;
  }

  /** `partyId` is a `PartyId` object that represents the party ID of the client */
  get partyId(): PartyId {
    this.isReadyGuard();
    return PartyId.parse(this._client.party_id);
  }

  /* `userId` is a `UserId` object that represents the user ID of the client */
  get userId(): UserId {
    this.isReadyGuard();
    return UserId.parse(this._client.user_id);
  }

  /** `clusterId` is a `ClusterId` object that represents the cluster ID of the client */
  get clusterId(): ClusterId {
    return this._config.clusterId;
  }

  /** `client` is a `Wasm.NillionClient` object that represents the client */
  get client(): Wasm.NillionClient {
    this.isReadyGuard();
    return this._client;
  }

  /** `connect` is an async function that connects the client to the cluster */
  async connect(): Promise<boolean> {
    if (!globalThis.__NILLION?.initialized) {
      await init();
    }

    const { clusterId, userSeed, nodeSeed, bootnodes } = this._config;
    const userKey = Wasm.UserKey.from_seed(userSeed);
    const nodeKey = Wasm.NodeKey.from_seed(nodeSeed);
    this._client = new Wasm.NillionClient(userKey, nodeKey, bootnodes);
    // TODO(tim): If this fails to connect a websocket.js error is logged and this method simply fails.
    //  Its unclear which context the error occurs in so I haven't yet been able to handle it gracefully.
    const descriptor = await this._client.cluster_information(clusterId);
    this._ready = true;

    Log("Connected to cluster: ", descriptor.id);
    return this._ready;
  }

  /** `isReadyGuard` is a function that checks if the client is ready */
  private isReadyGuard(): void | never {
    if (!this._ready) {
      const message = "NilVmClient not ready. Call `await client.connect()`.";
      Log(message);
      throw new Error(message);
    }
  }

  /** `fetchClusterInfo` is an effect that fetches the cluster information */
  fetchClusterInfo(): E.Effect<ClusterDescriptor, UnknownException> {
    return E.tryPromise(async () => {
      const response = await this.client.cluster_information(this.clusterId);
      const descriptor = ClusterDescriptor.parse(response);
      Log("Fetched cluster info: %O", descriptor);
      return descriptor;
    });
  }

  /** `fetchComputeOutput` is an effect that fetches the compute */
  fetchComputeOutput(args: {
    id: ComputeOutputId;
  }): E.Effect<Record<string, NadaPrimitiveValue>, UnknownException> {
    return E.tryPromise(async () => {
      const { id } = args;
      const response = (await this.client.compute_result(id)) as Record<
        string,
        NadaPrimitiveValue
      >;
      Log(`Retrieved ${id} result:`, response);
      return response;
    });
  }

  /** `fetchOperationQuote` is an effect that fetches the operation quote */
  fetchOperationQuote(args: {
    operation: IntoWasmQuotableOperation & { type: OperationType };
  }): E.Effect<PriceQuote, UnknownException> {
    return E.tryPromise(async () => {
      const { operation } = args;
      const response = await this.client.request_price_quote(
        this.clusterId,
        operation.intoQuotable(),
      );
      const result = priceQuoteFrom(response);
      Log(`Quoted %d unil for %s`, result.cost.total, operation.type);
      return result;
    });
  }

  /** `fetchValue` is an effect that fetches the value */
  fetchValue(args: {
    receipt: PaymentReceipt;
    operation: FetchValue;
  }): E.Effect<NadaValue, UnknownException> {
    return E.tryPromise(async () => {
      const { receipt, operation } = args;
      const { id, name, type } = operation.args;

      const wasmReceipt = paymentReceiptInto(receipt);
      const response = await this.client.retrieve_value(
        this.clusterId,
        id,
        name,
        wasmReceipt,
      );
      wasmReceipt.free();
      receipt.quote.inner.free();

      const result = NadaValue.fromWasm(type, response);
      Log(`Fetched ${type} from ${id}`);
      return result;
    });
  }

  /** `fetchStoreAcl` is an effect that fetches the store acl */
  fetchStoreAcl(args: {
    receipt: PaymentReceipt;
    operation: FetchStoreAcl;
  }): E.Effect<StoreAcl, UnknownException> {
    return E.tryPromise(async () => {
      const { receipt, operation } = args;
      const { id } = operation.args;

      const wasmReceipt = paymentReceiptInto(receipt);
      const response = await this.client.retrieve_permissions(
        this.clusterId,
        id,
        wasmReceipt,
      );
      wasmReceipt.free();
      receipt.quote.inner.free();

      const result = StoreAcl.from(response);
      Log(`Fetched acl for store ${id}. Acl=%O`, result);
      return result;
    });
  }

  /** `setStoreAcl` is an effect that sets the store acl */
  setStoreAcl(args: {
    receipt: PaymentReceipt;
    operation: SetStoreAcl;
  }): E.Effect<ActionId, UnknownException> {
    return E.tryPromise(async () => {
      const { receipt, operation } = args;
      const { id, acl } = operation.args;

      const wasmReceipt = paymentReceiptInto(receipt);
      const wasmPermissions = acl.into();
      const response = await this.client.update_permissions(
        this.clusterId,
        id,
        wasmPermissions,
        wasmReceipt,
      );
      // wasmPermissions?.free(); causes a WASM/rust NPE??
      wasmReceipt.free();
      receipt.quote.inner.free();

      const result = ActionId.parse(response);
      Log(`Set store Acl for ${id} to Acl=%O`, acl);
      return result;
    });
  }

  /** `compute` is an effect that computes the operation */
  compute(args: {
    receipt: PaymentReceipt;
    operation: Compute;
  }): E.Effect<ComputeOutputId, UnknownException> {
    return E.tryPromise(async () => {
      const { receipt, operation } = args;
      const { bindings, storeIds, values } = operation.args;

      const wasmValues = values.into();
      const wasmReceipt = paymentReceiptInto(receipt);
      const response = await this.client.compute(
        this.clusterId,
        bindings.into(),
        storeIds,
        wasmValues,
        wasmReceipt,
      );
      wasmValues.free();
      wasmReceipt.free();
      receipt.quote.inner.free();

      const result = ComputeOutputId.parse(response);
      Log(`Compute started resultId=${result}`);
      return result;
    });
  }

  /** `storeProgram` is an effect that stores the program */
  storeProgram(args: {
    receipt: PaymentReceipt;
    operation: StoreProgram;
  }): E.Effect<ProgramId, UnknownException> {
    return E.tryPromise(async () => {
      const { receipt, operation } = args;
      const { name, program } = operation.args;

      const wasmReceipt = paymentReceiptInto(receipt);
      const response = await this.client.store_program(
        this.clusterId,
        name,
        program,
        wasmReceipt,
      );
      wasmReceipt.free();
      receipt.quote.inner.free();

      const id = ProgramId.parse(response);
      Log(`program stored with id=${id}`);
      return id;
    });
  }

  /** `deleteProgram` is an effect that deletes the program */
  deleteValues(args: { id: StoreId }): E.Effect<StoreId, UnknownException> {
    return E.tryPromise(async () => {
      const { id } = args;
      await this.client.delete_values(this.clusterId, id);
      Log(`Deleted values at ${id}`);
      return id;
    });
  }

  /** `deleteProgram` is an effect that deletes the program */
  updateValues(args: {
    receipt: PaymentReceipt;
    operation: UpdateValue;
  }): E.Effect<ActionId, UnknownException> {
    return E.tryPromise(async () => {
      const { receipt, operation } = args;
      const { id, values } = operation.args;

      const wasmValues = values.into();
      const wasmReceipt = paymentReceiptInto(receipt);
      const response = await this.client.update_values(
        this.clusterId,
        id,
        wasmValues,
        wasmReceipt,
      );
      wasmValues.free();
      wasmReceipt.free();
      receipt.quote.inner.free();

      Log(`Updated values at ${id}`);
      return ActionId.parse(response);
    });
  }

  /** `storeValues` is an effect that stores the values */
  storeValues(args: {
    receipt: PaymentReceipt;
    operation: StoreValue;
  }): E.Effect<StoreId, UnknownException> {
    return E.tryPromise(async () => {
      const { receipt, operation } = args;
      const { values, acl } = operation.args;

      const wasmValues = values.into();
      const wasmReceipt = paymentReceiptInto(receipt);
      const wasmPermissions = acl?.into();
      const response = await this.client.store_values(
        this.clusterId,
        wasmValues,
        wasmPermissions,
        wasmReceipt,
      );
      // wasmPermissions?.free(); causes a WASM/rust NPE??
      wasmValues.free();
      wasmReceipt.free();
      receipt.quote.inner.free();

      Log(`Stored values ${values.toString()} at ${response}`);
      return StoreId.parse(response);
    });
  }

  /** `create` is a static function that creates a new NilVmClient */
  static create = (args: NilVmClientConfig) => new NilVmClient(args);
}
