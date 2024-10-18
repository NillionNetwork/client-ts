import { create } from "@bufbuild/protobuf";
import { createClient } from "@connectrpc/connect";
import { z } from "zod";

import { PoolStatusResponse } from "@nillion/client-vms/gen-proto/nillion/leader_queries/v1/pool_status_pb";
import { LeaderQueries } from "@nillion/client-vms/gen-proto/nillion/leader_queries/v1/service_pb";
import { PriceQuoteRequestSchema } from "@nillion/client-vms/gen-proto/nillion/payments/v1/quote_pb";
import { SignedReceipt } from "@nillion/client-vms/gen-proto/nillion/payments/v1/receipt_pb";
import { VmClient } from "@nillion/client-vms/vm/client";
import { Operation } from "@nillion/client-vms/vm/operation/operation";

export const QueryPoolStatusConfig = z.object({
  vm: z.custom<VmClient>(),
});
export type QueryPoolStatusConfig = z.infer<typeof QueryPoolStatusConfig>;

export class QueryPoolStatus implements Operation<PoolStatusResponse> {
  private constructor(private readonly config: QueryPoolStatusConfig) {}

  async invoke(): Promise<PoolStatusResponse> {
    const client = createClient(LeaderQueries, this.config.vm.leader.transport);
    const signedReceipt = await this.pay();
    return client.poolStatus({
      signedReceipt,
    });
  }

  pay(): Promise<SignedReceipt> {
    return this.config.vm.payer.payForOperation(
      create(PriceQuoteRequestSchema, {
        operation: {
          case: "poolStatus",
          value: {},
        },
      }),
    );
  }

  static new(config: QueryPoolStatusConfig): QueryPoolStatus {
    return new QueryPoolStatus(config);
  }
}

export class QueryPoolStatusBuilder {
  private constructor(private readonly vm: VmClient) {}

  build(): QueryPoolStatus {
    const config = QueryPoolStatusConfig.parse({
      vm: this.vm,
    });
    return QueryPoolStatus.new(config);
  }

  static init = (vm: VmClient): QueryPoolStatusBuilder =>
    new QueryPoolStatusBuilder(vm);
}
