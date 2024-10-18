import { z } from "zod";

import { PoolStatusResponse } from "@nillion/client-vms/gen-proto/nillion/leader_queries/v1/pool_status_pb";
import { PaymentClient } from "@nillion/client-vms/payment";
import { GrpcTransport, PartyId } from "@nillion/client-vms/types";
import { SecretMasker } from "@nillion/client-wasm";

import {
  DeleteValuesBuilder,
  QueryPoolStatusBuilder,
  RetrievePermissionsBuilder,
  RetrieveValuesBuilder,
  StoreValuesBuilder,
} from "./operation";

export const NodeConfig = z.object({
  id: z.instanceof(PartyId),
  transport: GrpcTransport,
});
export type NodeConfig = z.infer<typeof NodeConfig>;

export const VmClientConfig = z.object({
  id: z.string().min(1),
  payer: z.instanceof(PaymentClient),
  masker: z.instanceof(SecretMasker),
  leader: NodeConfig,
  nodes: z.array(NodeConfig),
});
export type VmClientConfig = z.infer<typeof VmClientConfig>;

export class VmClient {
  constructor(readonly config: VmClientConfig) {}

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
}
