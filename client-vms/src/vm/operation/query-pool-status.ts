import { create } from "@bufbuild/protobuf";
import { createClient } from "@connectrpc/connect";
import { z } from "zod";

import type { PoolStatusResponse } from "#/gen-proto/nillion/leader_queries/v1/pool_status_pb";
import { LeaderQueries } from "#/gen-proto/nillion/leader_queries/v1/service_pb";
import { PriceQuoteRequestSchema } from "#/gen-proto/nillion/payments/v1/quote_pb";
import type { SignedReceipt } from "#/gen-proto/nillion/payments/v1/receipt_pb";
import type { VmClient } from "#/vm/client";
import type { Operation } from "#/vm/operation/operation";

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
