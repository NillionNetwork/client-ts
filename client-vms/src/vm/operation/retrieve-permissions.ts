import { create } from "@bufbuild/protobuf";
import { type Client, createClient } from "@connectrpc/connect";
import { PriceQuoteRequestSchema } from "@nillion/client-vms/gen-proto/nillion/payments/v1/quote_pb";
import type { SignedReceipt } from "@nillion/client-vms/gen-proto/nillion/payments/v1/receipt_pb";
import {
  type RetrievePermissionsRequest,
  RetrievePermissionsRequestSchema,
} from "@nillion/client-vms/gen-proto/nillion/permissions/v1/retrieve_pb";
import { Permissions as PermissionsService } from "@nillion/client-vms/gen-proto/nillion/permissions/v1/service_pb";
import { Log } from "@nillion/client-vms/logger";
import { type PartyId, Uuid } from "@nillion/client-vms/types/types";
import { ValuesPermissions } from "@nillion/client-vms/types/values-permissions";
import { collapse } from "@nillion/client-vms/util";
import type { VmClient } from "@nillion/client-vms/vm/client";
import type { Operation } from "@nillion/client-vms/vm/operation/operation";
import { retryGrpcRequestIfRecoverable } from "@nillion/client-vms/vm/operation/retry-client";
import { Effect as E, pipe } from "effect";
import type { UnknownException } from "effect/Cause";
import { parse as parseUuid } from "uuid";
import { z } from "zod";

export const RetrievePermissionsConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
  id: Uuid,
});
export type RetrievePermissionsConfig = z.infer<
  typeof RetrievePermissionsConfig
>;

type NodeRequestOptions = {
  nodeId: PartyId;
  client: Client<typeof PermissionsService>;
  request: RetrievePermissionsRequest;
};

export class RetrievePermissions implements Operation<ValuesPermissions> {
  private constructor(private readonly config: RetrievePermissionsConfig) {}

  invoke(): Promise<ValuesPermissions> {
    return pipe(
      E.tryPromise(() => this.pay()),
      E.map((receipt) => this.prepareRequestPerNode(receipt)),
      E.flatMap(E.all),
      E.map((requests) =>
        requests.map((request) =>
          retryGrpcRequestIfRecoverable<ValuesPermissions>(
            "RetrievePermissions",
            this.invokeNodeRequest(request),
          ),
        ),
      ),
      E.flatMap((effects) =>
        E.all(effects, { concurrency: this.config.vm.nodes.length }),
      ),
      E.flatMap(collapse),
      E.tapBoth({
        onFailure: (e) =>
          E.sync(() => Log("Retrieve permissions failed: %O", e)),
        onSuccess: (data) =>
          E.sync(() => Log("Retrieved permissions: %O", data)),
      }),
      E.runPromise,
    );
  }

  prepareRequestPerNode(
    signedReceipt: SignedReceipt,
  ): E.Effect<NodeRequestOptions, UnknownException>[] {
    return this.config.vm.nodes.map((node) =>
      E.succeed({
        nodeId: node.id,
        client: createClient(PermissionsService, node.transport),
        request: create(RetrievePermissionsRequestSchema, {
          signedReceipt,
        }),
      }),
    );
  }

  invokeNodeRequest(
    options: NodeRequestOptions,
  ): E.Effect<ValuesPermissions, UnknownException> {
    const { nodeId, client, request } = options;
    return pipe(
      E.tryPromise(() => client.retrievePermissions(request)),
      E.map((response) => ValuesPermissions.from(response)),
      E.tap((_permissions) =>
        Log(
          `Retrieved permissions: node=${nodeId.toBase64()} values=${this.config.id} `,
        ),
      ),
    );
  }

  private async pay(): Promise<SignedReceipt> {
    const {
      id,
      vm: { payer },
    } = this.config;

    return payer.payForOperation(
      create(PriceQuoteRequestSchema, {
        operation: {
          case: "retrievePermissions",
          value: {
            valuesId: parseUuid(id),
          },
        },
      }),
    );
  }

  static new(config: RetrievePermissionsConfig): RetrievePermissions {
    return new RetrievePermissions(config);
  }
}

export class RetrievePermissionsBuilder {
  private _id?: Uuid;
  private constructor(private readonly vm: VmClient) {}

  id(value: Uuid): this {
    this._id = value;
    return this;
  }

  build(): RetrievePermissions {
    const config = RetrievePermissionsConfig.parse({
      vm: this.vm,
      id: this._id,
    });
    return RetrievePermissions.new(config);
  }

  static init = (vm: VmClient): RetrievePermissionsBuilder =>
    new RetrievePermissionsBuilder(vm);
}
