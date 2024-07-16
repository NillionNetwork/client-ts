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
import { Result } from "./result";
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

  get partyId(): PartyId {
    return PartyId.parse(this.client.party_id);
  }

  get userId(): UserId {
    return UserId.parse(this.client.user_id);
  }

  async clusterInfoRetrieve(): Promise<Result<ClusterDescriptor>> {
    try {
      const response = await this.client.cluster_information(this.clusterId);
      const parsed = ClusterDescriptor.parse(response);
      Log("NilVmClient::clusterInfoRetrieve payload: ", parsed);
      return Result.Ok(parsed);
    } catch (e) {
      return Result.Err(e as Error);
    }
  }

  async computeResultRetrieve(args: {
    id: ComputeResultId;
  }): Promise<Result<Map<string, NadaWrappedValue>>> {
    try {
      const { id } = args;
      // TODO(tim): why does it not have cluster id as a param?
      const response = await this.client.compute_result(id);
      Log(`retrieved compute result for id=${id} value=${response}`);
      return Result.Ok(response);
    } catch (e) {
      return Result.Err(e as Error);
    }
  }

  async priceQuoteRequest(args: {
    operation: IntoWasmQuotableOperation;
  }): Promise<Result<PriceQuote>> {
    try {
      const { operation } = args;
      const response = await this.client.request_price_quote(
        this.clusterId,
        operation.intoQuotable(),
      );
      const result = priceQuoteFrom(response);
      Log(`quote ${result.cost.total} unil for ${operation.toString()}`);
      return Result.Ok(result);
    } catch (e) {
      console.error(e);
      return Result.Err(e as Error);
    }
  }

  async valueRetrieve(args: {
    receipt: PaymentReceipt;
    operation: ValueRetrieve;
  }): Promise<Result<NadaValue>> {
    try {
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
      return Result.Ok(result);
    } catch (e) {
      console.error(e);
      return Result.Err(e as Error);
    }
  }

  async permissionsRetrieve(args: {
    receipt: PaymentReceipt;
    operation: PermissionsRetrieve;
  }): Promise<Result<Permissions>> {
    try {
      const { receipt, operation } = args;
      const { id } = operation.args;
      const response = await this.client.retrieve_permissions(
        this.clusterId,
        id,
        paymentReceiptInto(receipt),
      );

      const result = Permissions.from(response);
      Log(`Fetched store=${id} permissions=${result}`);
      return Result.Ok(result);
    } catch (e) {
      console.error(e);
      return Result.Err(e as Error);
    }
  }

  async permissionsUpdate(args: {
    receipt: PaymentReceipt;
    operation: PermissionsSet;
  }): Promise<Result<ActionId>> {
    try {
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
      return Result.Ok(result);
    } catch (e) {
      console.error(e);
      return Result.Err(e as Error);
    }
  }

  async compute(args: {
    receipt: PaymentReceipt;
    operation: Compute;
  }): Promise<Result<ComputeResultId>> {
    try {
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
      return Result.Ok(result);
    } catch (e) {
      console.error(e);
      return Result.Err(e as Error);
    }
  }

  async programStore(args: {
    receipt: PaymentReceipt;
    operation: ProgramStore;
  }): Promise<Result<ProgramId>> {
    try {
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
      return Result.Ok(id);
    } catch (e) {
      console.error(e);
      return Result.Err(e as Error);
    }
  }

  async valuesDelete(args: { id: StoreId }): Promise<Result<StoreId>> {
    try {
      const { id } = args;
      await this.client.delete_values(this.clusterId, id);
      Log(`deleted value at store id=${id}`);
      return Result.Ok(id);
    } catch (e) {
      console.error(e);
      return Result.Err(e as Error);
    }
  }

  async valuesUpdate(args: {
    receipt: PaymentReceipt;
    operation: ValuesUpdate;
  }): Promise<Result<ActionId>> {
    try {
      const { receipt, operation } = args;
      const { id, values } = operation.args;
      const response = await this.client.update_values(
        this.clusterId,
        id,
        values.into(),
        paymentReceiptInto(receipt),
      );

      const result = ActionId.parse(response);
      Log(`updated store id=${id}, action id=${result}`);
      return Result.Ok(result);
    } catch (e) {
      console.error(e);
      return Result.Err(e as Error);
    }
  }

  async valuesStore(args: {
    receipt: PaymentReceipt;
    operation: ValuesStore;
  }): Promise<Result<StoreId>> {
    try {
      const { receipt, operation } = args;
      const { values, permissions } = operation.args;
      const response = await this.client.store_values(
        this.clusterId,
        values.into(),
        permissions?.into(),
        paymentReceiptInto(receipt),
      );

      const result = StoreId.parse(response);
      Log(`${values} stored id=${result}`);
      return Result.Ok(result);
    } catch (e) {
      console.error(e);
      return Result.Err(e as Error);
    }
  }

  static create(args: NilVmClientArgs): NilVmClient {
    const userKey = Wasm.UserKey.from_seed(args.userSeed);
    const nodeKey = Wasm.NodeKey.from_seed(args.nodeSeed);
    const nilvm = new Wasm.NillionClient(userKey, nodeKey, args.bootnodes);

    return new NilVmClient(args.clusterId, nilvm);
  }
}
