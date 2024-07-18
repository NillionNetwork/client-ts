import * as Wasm from "@nillion/wasm";
import {
  ActionId,
  ClusterDescriptor,
  ClusterId,
  ComputeResultId,
  Multiaddr,
  PartyId,
  PaymentReceipt,
  PriceQuote,
  ProgramId,
  StoreId,
  UserId,
} from "./types";
import { Log } from "./logger";
import {
  IntoWasmQuotableOperation,
  paymentReceiptInto,
  priceQuoteFrom,
} from "./wasm";
import { NadaValue, NadaWrappedValue, Permissions } from "./nada";
import {
  Compute,
  OperationType,
  PermissionsRetrieve,
  PermissionsSet,
  ProgramStore,
  ValueRetrieve,
  ValuesStore,
  ValuesUpdate,
} from "./operation";
import { Effect as E } from "effect";
import { UnknownException } from "effect/Cause";
import { init } from "./init";

export interface NilVmClientConnectionArgs {
  bootnodes: Multiaddr[];
  clusterId: ClusterId;
  userSeed: string;
  nodeSeed: string;
}

export class NilVmClient {
  // These fields are lazily loaded because the wasm bundle is async. At some point in the client's use
  // there has to be an async call to init so we wrap that into our connect method. Meaning the client
  // can be created sync and avoiding top-level async.
  // @ts-expect-error lazily loaded on `connect()` to avoid top level waits
  private _client: Wasm.NillionClient;
  // @ts-expect-error lazily loaded on `connect()` to avoid top level waits
  private _cluster: ClusterId;
  private _ready = false;

  get ready(): boolean {
    return this._ready;
  }

  get partyId(): PartyId {
    this.isReadyGuard();
    return PartyId.parse(this._client.party_id);
  }

  get userId(): UserId {
    this.isReadyGuard();
    return UserId.parse(this._client.user_id);
  }

  get clusterId(): ClusterId {
    this.isReadyGuard();
    return this._cluster;
  }

  get client(): Wasm.NillionClient {
    this.isReadyGuard();
    return this._client;
  }

  async connect(args: NilVmClientConnectionArgs): Promise<boolean> {
    if (!globalThis.__NILLION?.initialized) {
      await init();
    }

    this._cluster = args.clusterId;
    const userKey = Wasm.UserKey.from_seed(args.userSeed);
    const nodeKey = Wasm.NodeKey.from_seed(args.nodeSeed);
    this._client = new Wasm.NillionClient(userKey, nodeKey, args.bootnodes);
    const descriptor = await this._client.cluster_information(this._cluster);
    this._ready = true;

    Log("Connected to cluster: ", descriptor.id);
    return this._ready;
  }

  private isReadyGuard(): void | never {
    if (!this._ready)
      throw new Error("NilVmClient not ready. Call `await client.connect()`.");
  }

  fetchClusterInfo(): E.Effect<ClusterDescriptor, UnknownException> {
    return E.tryPromise(async () => {
      const response = await this.client.cluster_information(this.clusterId);
      const descriptor = ClusterDescriptor.parse(response);
      Log("Fetched cluster info: %O", descriptor);
      return descriptor;
    });
  }

  fetchRunProgramResult(args: {
    id: ComputeResultId;
  }): E.Effect<Map<string, NadaWrappedValue>, UnknownException> {
    return E.tryPromise(async () => {
      const { id } = args;
      const response = (await this.client.compute_result(id)) as Map<
        string,
        NadaWrappedValue
      >;
      Log(`Retrieved ${id} result:`, response);
      return response;
    });
  }

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

  fetchValue(args: {
    receipt: PaymentReceipt;
    operation: ValueRetrieve;
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

  fetchPermissions(args: {
    receipt: PaymentReceipt;
    operation: PermissionsRetrieve;
  }): E.Effect<Permissions, UnknownException> {
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

      const result = Permissions.from(response);
      Log(`Fetched permissions for ${id} result=`, result);
      return result;
    });
  }

  setPermissions(args: {
    receipt: PaymentReceipt;
    operation: PermissionsSet;
  }): E.Effect<ActionId, UnknownException> {
    return E.tryPromise(async () => {
      const { receipt, operation } = args;
      const { id, permissions } = operation.args;

      const wasmReceipt = paymentReceiptInto(receipt);
      const wasmPermissions = permissions.into();
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
      Log(`Set permissions for ${id}`);
      return result;
    });
  }

  runProgram(args: {
    receipt: PaymentReceipt;
    operation: Compute;
  }): E.Effect<ComputeResultId, UnknownException> {
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

      const result = ComputeResultId.parse(response);
      Log(`Compute started resultId=${result}`);
      return result;
    });
  }

  storeProgram(args: {
    receipt: PaymentReceipt;
    operation: ProgramStore;
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

  deleteValues(args: { id: StoreId }): E.Effect<StoreId, UnknownException> {
    return E.tryPromise(async () => {
      const { id } = args;
      await this.client.delete_values(this.clusterId, id);
      Log(`Deleted values at ${id}`);
      return id;
    });
  }

  updateValues(args: {
    receipt: PaymentReceipt;
    operation: ValuesUpdate;
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

  storeValues(args: {
    receipt: PaymentReceipt;
    operation: ValuesStore;
  }): E.Effect<StoreId, UnknownException> {
    return E.tryPromise(async () => {
      const { receipt, operation } = args;
      const { values, permissions } = operation.args;
      console.log("about to store values");
      const wasmValues = values.into();
      const wasmReceipt = paymentReceiptInto(receipt);
      const wasmPermissions = permissions?.into();
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

  static create = () => new NilVmClient();
}
