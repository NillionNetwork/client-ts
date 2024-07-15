import * as Wasm from "@nillion/client-wasm";
import {
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
  ValueId,
} from "./types";
import { Log } from "./logger";
import { Result } from "./result";
import { IntoWasm, IntoWasmQuotableOperation } from "./wasm";
import {
  NadaValue,
  NadaValues,
  NadaValueType,
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
    resultId: ComputeResultId,
  ): Promise<Result<NadaValue>> {
    try {
      const response = await this.client.compute_result(
        // this.clusterId, TODO(tim): why does it not have cluster id as a param?
        resultId,
      );
      const result = NadaValue.fromWasm(
        NadaValueType.enum.IntegerSecret,
        response,
      );
      Log(`retrieved compute result for id=${result} value=${result}`);
      return Result.Ok(result);
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
      const result = PriceQuote.parse(response);
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
    valueId: ValueId,
  ): Promise<Result<NadaValue>> {
    try {
      const response = await this.client.retrieve_value(
        this.clusterId,
        storeId,
        valueId,
        receipt.into(),
      );
      const result = NadaValue.fromWasm(
        NadaValueType.enum.IntegerSecret,
        response,
      );
      Log("NilVmClient::valueRetrieve payload: ", result);
      return Result.Ok(result);
    } catch (e) {
      console.error(e);
      return Result.Err(e as Error);
    }
  }

  async permissionsRetrieve(
    receipt: PaymentReceipt,
    storeId: StoreId,
  ): Promise<Result<Permissions>> {
    try {
      const response = await this.client.retrieve_permissions(
        this.clusterId,
        storeId,
        receipt.into(),
      );

      const result = Permissions.fromWasm(response);
      Log(`retrieved permissions for store=${storeId} acl=${result}`);
      return Result.Ok(result);
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
        receipt.into(),
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
        receipt.into(),
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
    name: string,
    program: Uint8Array,
  ): Promise<Result<ProgramId>> {
    try {
      const response = await this.client.store_program(
        this.clusterId,
        name,
        program,
        receipt.into(),
      );
      const id = ProgramId.parse(response);
      Log(`program stored with id=${id}`);
      return Result.Ok(id);
    } catch (e) {
      console.error(e);
      return Result.Err(e as Error);
    }
  }

  async valueDelete(storeId: StoreId): Promise<Result<undefined>> {
    try {
      await this.client.delete_values(this.clusterId, storeId);
      Log(`deleted value at store id=${storeId}`);
      return Result.Ok(undefined);
    } catch (e) {
      console.error(e);
      return Result.Err(e as Error);
    }
  }

  async valuesUpdate(
    receipt: PaymentReceipt,
    storeId: StoreId,
    values: NadaValues,
  ): Promise<Result<StoreId>> {
    try {
      const response = await this.client.update_values(
        this.clusterId,
        storeId,
        values.into(),
        receipt.into(),
      );
      const result = StoreId.parse(response);
      Log(`updated values at ${storeId}, new store id=${result}`);
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
        receipt.into(),
      );
      const result = StoreId.parse(response);
      Log("NilVmClient::valuesStore payload: ", result);
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
