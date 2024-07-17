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
  PermissionsRetrieve,
  PermissionsSet,
  ProgramStore,
  ValueRetrieve,
  ValuesStore,
  ValuesUpdate,
} from "./operation";
import { Effect as E } from "effect";
import { UnknownException } from "effect/Cause";

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
  ) {
    // E.tryPromise seems to bind 'this' when used in this class so that when these
    // are lazily invoked 'this.client' doesn't exist. So, we bind to preserve 'this'.
    // Oddly this isn't needed for fetchClusterInfo.
    this.deleteValues = this.deleteValues.bind(this);
    this.fetchValue = this.fetchValue.bind(this);
    this.storeValues = this.storeValues.bind(this);
    this.updateValues = this.updateValues.bind(this);

    this.fetchPermissions = this.fetchPermissions.bind(this);
    this.setPermissions = this.setPermissions.bind(this);

    this.runProgram = this.runProgram.bind(this);
    this.storeProgram = this.storeProgram.bind(this);

    this.fetchClusterInfo = this.fetchClusterInfo.bind(this);
  }

  get partyId(): PartyId {
    return PartyId.parse(this.client.party_id);
  }

  get userId(): UserId {
    return UserId.parse(this.client.user_id);
  }

  fetchClusterInfo(): E.Effect<ClusterDescriptor, UnknownException> {
    return E.tryPromise(async () => {
      const response = await this.client.cluster_information(this.clusterId);
      Log("fetched cluster info: ", response);
      return ClusterDescriptor.parse(response);
    });
  }

  fetchRunProgramResult(args: {
    id: ComputeResultId;
  }): E.Effect<Map<string, NadaWrappedValue>, UnknownException> {
    return E.tryPromise(async () => {
      const { id } = args;
      // TODO(tim): why does it not have cluster id as a param?
      const response = await this.client.compute_result(id);
      Log(`retrieved compute result for id=${id} value=${response}`);
      return response;
    });
  }

  fetchOperationQuote(args: {
    operation: IntoWasmQuotableOperation;
  }): E.Effect<PriceQuote, UnknownException> {
    return E.tryPromise(async () => {
      const { operation } = args;
      const response = await this.client.request_price_quote(
        this.clusterId,
        operation.intoQuotable(),
      );
      const result = priceQuoteFrom(response);
      Log(`quote ${result.cost.total} unil for ${operation.toString()}`);
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
      const response = await this.client.retrieve_value(
        this.clusterId,
        id,
        name,
        paymentReceiptInto(receipt),
      );
      const result = NadaValue.fromWasm(type, response);

      Log(`Retrieve type=${type} at store=${id}: ${result}`);
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
      const response = await this.client.retrieve_permissions(
        this.clusterId,
        id,
        paymentReceiptInto(receipt),
      );

      const result = Permissions.from(response);
      Log(`Fetched store=${id} permissions=${result}`);
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
      const response = await this.client.update_permissions(
        this.clusterId,
        id,
        permissions.into(),
        paymentReceiptInto(receipt),
      );

      const result = ActionId.parse(response);
      Log(`Set permissions for store=${id} to action=${result}`);
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
      const response = await this.client.compute(
        this.clusterId,
        bindings.into(),
        storeIds,
        values.into(),
        paymentReceiptInto(receipt),
      );

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
      const response = await this.client.store_program(
        this.clusterId,
        name,
        program,
        paymentReceiptInto(receipt),
      );

      const id = ProgramId.parse(response);
      Log(`program stored with id=${id}`);
      return id;
    });
  }

  deleteValues(args: { id: StoreId }): E.Effect<StoreId, UnknownException> {
    return E.tryPromise(async () => {
      const { id } = args;
      await this.client.delete_values(this.clusterId, id);
      Log(`deleted value at store id=${id}`);
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
      const response = await this.client.update_values(
        this.clusterId,
        id,
        values.into(),
        paymentReceiptInto(receipt),
      );

      Log(`updated store id=${id}, action id=${response}`);
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

      const response = await this.client.store_values(
        this.clusterId,
        values.into(),
        permissions?.into(),
        paymentReceiptInto(receipt),
      );

      Log(`${values} stored id=${response}`);

      return StoreId.parse(response);
    });
  }

  static create(args: NilVmClientArgs): NilVmClient {
    const userKey = Wasm.UserKey.from_seed(args.userSeed);
    const nodeKey = Wasm.NodeKey.from_seed(args.nodeSeed);
    const nilvm = new Wasm.NillionClient(userKey, nodeKey, args.bootnodes);
    return new NilVmClient(args.clusterId, nilvm);
  }
}
