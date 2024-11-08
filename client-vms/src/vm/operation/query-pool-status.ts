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

export const PreprocessingOffsets = z.object({
  element: z.number(),
  start: z.bigint(),
  end: z.bigint(),
});
export type PreprocessingOffsets = z.infer<typeof PreprocessingOffsets>;

export const PoolStatus = z.object({
  offsets: z.array(PreprocessingOffsets),
  preprocessingActive: z.boolean(),
});
export type PoolStatus = z.infer<typeof PoolStatus>;

export class QueryPoolStatus implements Operation<PoolStatus> {
  private constructor(private readonly config: QueryPoolStatusConfig) {}

  async invoke(): Promise<PoolStatus> {
    return pipe(
      E.tryPromise(() => this.pay()),
      E.flatMap((receipt) => this.prepareLeaderRequest(receipt)),
      E.flatMap((request) =>
        retryGrpcRequestIfRecoverable<PoolStatusResponse>(
          "QueryPoolStatus",
          this.invokeNodeRequest(request),
        ),
      ),
      E.flatMap((response) => E.try(() => PoolStatus.parse(response))),
      E.tapBoth({
        onFailure: (e) =>
          E.sync(() => Log.error("Query pool status failed: %O", e)),
        onSuccess: (status) =>
          E.sync(() => Log.info("Pool status: %O", status)),
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
