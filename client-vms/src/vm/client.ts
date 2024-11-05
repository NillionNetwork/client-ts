import { SecretMasker } from "@nillion/client-wasm";
import { z } from "zod";
import type { PoolStatusResponse } from "#/gen-proto/nillion/leader_queries/v1/pool_status_pb";
import { PaymentClient } from "#/payment/client";
import { GrpcTransport } from "#/types/grpc";
import { PartyId } from "#/types/types";
import { UserId } from "#/types/user-id";
import { DeleteValuesBuilder } from "./operation/delete-values";
import { InvokeComputeBuilder } from "./operation/invoke-compute";
import { OverwritePermissionsBuilder } from "./operation/overwrite-permissions";
import { QueryPoolStatusBuilder } from "./operation/query-pool-status";
import { RetrieveComputeResultBuilder } from "./operation/retrieve-compute-result";
import { RetrievePermissionsBuilder } from "./operation/retrieve-permissions";
import { RetrieveValuesBuilder } from "./operation/retrieve-values";
import { StoreProgramBuilder } from "./operation/store-program";
import { StoreValuesBuilder } from "./operation/store-values";
import { UpdatePermissionsBuilder } from "./operation/update-permissions";

export const NodeConfig = z.object({
  id: z.instanceof(PartyId),
  transport: GrpcTransport,
});
export type NodeConfig = z.infer<typeof NodeConfig>;

export const VmClientConfig = z.object({
  id: z.instanceof(UserId),
  payer: z.instanceof(PaymentClient),
  masker: z.instanceof(SecretMasker),
  leader: NodeConfig,
  nodes: z.array(NodeConfig),
});
export type VmClientConfig = z.infer<typeof VmClientConfig>;

export class VmClient {
  constructor(readonly config: VmClientConfig) {}

  get id(): UserId {
    return this.config.id;
  }

  get leader(): NodeConfig {
    return this.config.leader;
  }

  get nodes(): NodeConfig[] {
    return this.config.nodes;
  }

  get payer(): PaymentClient {
    return this.config.payer;
  }

  get masker(): SecretMasker {
    return this.config.masker;
  }

  queryPoolStatus(): Promise<PoolStatusResponse> {
    return QueryPoolStatusBuilder.init(this).build().invoke();
  }

  storeValues(): StoreValuesBuilder {
    return StoreValuesBuilder.init(this);
  }

  retrieveValues(): RetrieveValuesBuilder {
    return RetrieveValuesBuilder.init(this);
  }

  deleteValues(): DeleteValuesBuilder {
    return DeleteValuesBuilder.init(this);
  }

  retrievePermissions(): RetrievePermissionsBuilder {
    return RetrievePermissionsBuilder.init(this);
  }

  updatePermissions(): UpdatePermissionsBuilder {
    return UpdatePermissionsBuilder.init(this);
  }

  overwritePermissions(): OverwritePermissionsBuilder {
    return OverwritePermissionsBuilder.init(this);
  }

  storeProgram(): StoreProgramBuilder {
    return StoreProgramBuilder.init(this);
  }

  invokeCompute(): InvokeComputeBuilder {
    return InvokeComputeBuilder.init(this);
  }

  retrieveComputeResult(): RetrieveComputeResultBuilder {
    return RetrieveComputeResultBuilder.init(this);
  }
}
