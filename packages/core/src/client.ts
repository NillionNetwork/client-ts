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
  ProgramName,
  StoreId,
  UserId,
  ValueName,
} from "./types";
import { Log } from "./logger";
import { Result } from "./result";
import {
  IntoWasm,
  IntoWasmQuotableOperation,
  paymentReceiptInto,
  priceQuoteFrom,
} from "./wasm";
import {
  NadaValue,
  NadaValues,
  NadaValueType,
  NadaWrappedValue,
  Permissions,
  ProgramBindings,
} from "./nada";

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

  async computeResultRetrieve(
    id: ComputeResultId,
  ): Promise<Result<Map<string, NadaWrappedValue>>> {
    try {
      // TODO(tim): why does it not have cluster id as a param?
      const response = await this.client.compute_result(id);
      Log(`retrieved compute result for id=${id} value=${response}`);
      return Result.Ok(response);
    } catch (e) {
      return Result.Err(e as Error);
    }
  }

  async priceQuoteRequest(
    operation: IntoWasmQuotableOperation,
  ): Promise<Result<PriceQuote>> {
    try {
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

  async valueRetrieve(
    receipt: PaymentReceipt,
    storeId: StoreId,
    valueId: ValueName,
    type: NadaValueType,
  ): Promise<Result<NadaValue>> {
    try {
      const response = await this.client.retrieve_value(
        this.clusterId,
        storeId,
        valueId,
        paymentReceiptInto(receipt),
      );

      const result = NadaValue.fromWasm(type, response);

      Log(`trying to retrieve type=${type} got: `, result);
      return Result.Ok(result);
    } catch (e) {
      console.error(e);
      return Result.Err(e as Error);
    }
  }

  async permissionsRetrieve(
    receipt: PaymentReceipt,
    storeId: StoreId,
  ): Promise<Result<Wasm.Permissions>> {
    try {
      const response = await this.client.retrieve_permissions(
        this.clusterId,
        storeId,
        paymentReceiptInto(receipt),
      );

      // TODO(tim): permissions needs to be converted wasm side
      // const result = Permissions.from(response);
      Log(`retrieved permissions for store=${storeId} acl=${response}`);
      return Result.Ok(response);
    } catch (e) {
      console.error(e);
      return Result.Err(e as Error);
    }
  }

  async permissionsUpdate(
    receipt: PaymentReceipt,
    storeId: StoreId,
    permissions: Permissions,
  ): Promise<Result<string>> {
    try {
      const response = await this.client.update_permissions(
        this.clusterId,
        storeId,
        permissions.into(),
        paymentReceiptInto(receipt),
      );

      const result = response; // action id?
      Log(`updated permissions for store=${storeId} to action=${result}`);
      return Result.Ok(result);
    } catch (e) {
      console.error(e);
      return Result.Err(e as Error);
    }
  }

  async compute(
    receipt: PaymentReceipt,
    bindings: ProgramBindings,
    storeIds: StoreId[],
    values: NadaValues,
  ): Promise<Result<string>> {
    try {
      const response = await this.client.compute(
        this.clusterId,
        bindings.into(),
        storeIds,
        values.into(),
        paymentReceiptInto(receipt),
      );

      const result = ComputeResultId.parse(response);
      Log(`compute started resultId=${result}`);
      return Result.Ok(result);
    } catch (e) {
      console.error(e);
      return Result.Err(e as Error);
    }
  }

  async programStore(
    receipt: PaymentReceipt,
    name: ProgramName,
    program: Uint8Array,
  ): Promise<Result<ProgramId>> {
    try {
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

  async valueDelete(id: StoreId): Promise<Result<StoreId>> {
    try {
      await this.client.delete_values(this.clusterId, id);
      Log(`deleted value at store id=${id}`);
      return Result.Ok(id);
    } catch (e) {
      console.error(e);
      return Result.Err(e as Error);
    }
  }

  async valuesUpdate(
    receipt: PaymentReceipt,
    storeId: StoreId,
    values: NadaValues,
  ): Promise<Result<ActionId>> {
    try {
      const response = await this.client.update_values(
        this.clusterId,
        storeId,
        values.into(),
        paymentReceiptInto(receipt),
      );
      const result = ActionId.parse(response);
      Log(`updated store id=${storeId}, action id=${result}`);
      return Result.Ok(result);
    } catch (e) {
      console.error(e);
      return Result.Err(e as Error);
    }
  }

  async valuesStore(
    receipt: PaymentReceipt,
    values: IntoWasm<Wasm.NadaValues>,
    permissions?: IntoWasm<Wasm.Permissions>,
  ): Promise<Result<StoreId>> {
    try {
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
