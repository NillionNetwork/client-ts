import { z } from "zod";

import { SecretMasker } from "@nillion/client-wasm";
import type { PoolStatusResponse } from "#/gen-proto/nillion/leader_queries/v1/pool_status_pb";
import { PaymentClient } from "#/payment";
import { GrpcTransport, PartyId, UserId } from "#/types";
import { InvokeComputeBuilder } from "#/vm/operation/invoke-compute";
import { OverwritePermissionsBuilder } from "#/vm/operation/overwrite-permissions";
import { RetrieveComputeResultBuilder } from "#/vm/operation/retrieve-compute-result";
import { UpdatePermissionsBuilder } from "#/vm/operation/update-permissions";

import {
  DeleteValuesBuilder,
  QueryPoolStatusBuilder,
  RetrievePermissionsBuilder,
  RetrieveValuesBuilder,
  StoreProgramBuilder,
  StoreValuesBuilder,
} from "./operation";

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
