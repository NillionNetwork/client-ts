import { create } from "@bufbuild/protobuf";
import { type Client, createClient } from "@connectrpc/connect";
import { Effect as E, pipe } from "effect";
import type { UnknownException } from "effect/Cause";
import { parse } from "uuid";
import { z } from "zod";
import {
  type DeleteValuesRequest,
  DeleteValuesRequestSchema,
} from "#/gen-proto/nillion/values/v1/delete_pb";
import { Values } from "#/gen-proto/nillion/values/v1/service_pb";
import { Log } from "#/logger";
import { type PartyId, Uuid } from "#/types/types";
import { collapse } from "#/util";
import type { VmClient } from "#/vm/client";
import type { Operation } from "#/vm/operation/operation";
import { retryGrpcRequestIfRecoverable } from "#/vm/operation/retry-client";

export const DeleteValuesConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
  id: Uuid,
});
export type DeleteValuesConfig = z.infer<typeof DeleteValuesConfig>;

type NodeRequestOptions = {
  nodeId: PartyId;
  client: Client<typeof Values>;
  request: DeleteValuesRequest;
};

export class DeleteValues implements Operation<Uuid> {
  private constructor(private readonly config: DeleteValuesConfig) {}

  invoke(): Promise<Uuid> {
    return pipe(
      this.prepareRequestPerNode(),
      E.all,
      E.map((requests) =>
        requests.map((request) =>
          retryGrpcRequestIfRecoverable<Uuid>(
            "DeleteValues",
            this.invokeNodeRequest(request),
          ),
        ),
      ),
      E.flatMap((effects) =>
        E.all(effects, { concurrency: this.config.vm.nodes.length }),
      ),
      E.flatMap(collapse),
      E.tapBoth({
        onFailure: (e) => E.sync(() => Log("Values delete failed: %O", e)),
        onSuccess: (id) => E.sync(() => Log(`Values deleted: ${id}`)),
      }),
      E.runPromise,
    );
  }

  prepareRequestPerNode(): E.Effect<NodeRequestOptions, UnknownException>[] {
    const valuesId = parse(this.config.id);

    return this.config.vm.nodes.map((node) =>
      E.succeed({
        nodeId: node.id,
        client: createClient(Values, node.transport),
        request: create(DeleteValuesRequestSchema, {
          valuesId,
        }),
      }),
    );
  }

  invokeNodeRequest(
    options: NodeRequestOptions,
  ): E.Effect<Uuid, UnknownException> {
    const { nodeId, client, request } = options;
    return pipe(
      E.tryPromise(() => client.deleteValues(request)),
      E.map((_response) => this.config.id),
      E.tap((id) =>
        Log(`Values deleted: node=${nodeId.toBase64()} values=${id} `),
      ),
    );
  }

  static new(config: DeleteValuesConfig): DeleteValues {
    return new DeleteValues(config);
  }
}

export class DeleteValuesBuilder {
  private _id?: Uuid;

  private constructor(private readonly vm: VmClient) {}

  id(value: Uuid): this {
    this._id = value;
    return this;
  }

  build(): DeleteValues {
    const config = DeleteValuesConfig.parse({
      vm: this.vm,
      id: this._id,
    });
    return DeleteValues.new(config);
  }

  static init = (vm: VmClient): DeleteValuesBuilder =>
    new DeleteValuesBuilder(vm);
}
