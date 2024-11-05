import { create } from "@bufbuild/protobuf";
import { type Client, createClient } from "@connectrpc/connect";
import { Effect as E, pipe } from "effect";
import type { UnknownException } from "effect/Cause";
import { z } from "zod";
import {
  type PoolStatusRequest,
  PoolStatusRequestSchema,
  type PoolStatusResponse,
} from "#/gen-proto/nillion/leader_queries/v1/pool_status_pb";
import { LeaderQueries } from "#/gen-proto/nillion/leader_queries/v1/service_pb";
import { PriceQuoteRequestSchema } from "#/gen-proto/nillion/payments/v1/quote_pb";
import type { SignedReceipt } from "#/gen-proto/nillion/payments/v1/receipt_pb";
import { Log } from "#/logger";
import type { VmClient } from "#/vm/client";
import type { Operation } from "#/vm/operation/operation";
import { retryGrpcRequestIfRecoverable } from "#/vm/operation/retry-client";

export const QueryPoolStatusConfig = z.object({
  vm: z.custom<VmClient>(),
});
export type QueryPoolStatusConfig = z.infer<typeof QueryPoolStatusConfig>;

type NodeRequestOptions = {
  client: Client<typeof LeaderQueries>;
  request: PoolStatusRequest;
};

export class QueryPoolStatus implements Operation<PoolStatusResponse> {
  private constructor(private readonly config: QueryPoolStatusConfig) {}

  async invoke(): Promise<PoolStatusResponse> {
    return pipe(
      E.tryPromise(() => this.pay()),
      E.flatMap((receipt) => this.prepareLeaderRequest(receipt)),
      E.flatMap((request) =>
        retryGrpcRequestIfRecoverable<PoolStatusResponse>(
          "QueryPoolStatus",
          this.invokeNodeRequest(request),
        ),
      ),
      E.tapBoth({
        onFailure: (e) =>
          E.sync(() => Log.error("Query pool status failed: %O", e)),
        onSuccess: (data) =>
          E.sync(() => Log.info("Got pool status: %O", data)),
      }),
      E.runPromise,
    );
  }

  prepareLeaderRequest(
    signedReceipt: SignedReceipt,
  ): E.Effect<NodeRequestOptions, UnknownException> {
    return E.succeed({
      client: createClient(LeaderQueries, this.config.vm.leader.transport),
      request: create(PoolStatusRequestSchema, { signedReceipt }),
    });
  }

  invokeNodeRequest(
    options: NodeRequestOptions,
  ): E.Effect<PoolStatusResponse, UnknownException> {
    const { client, request } = options;
    return pipe(E.tryPromise(() => client.poolStatus(request)));
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
