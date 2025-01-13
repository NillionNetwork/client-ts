import { create } from "@bufbuild/protobuf";
import { type Client, createClient } from "@connectrpc/connect";
import { Effect as E, pipe } from "effect";
import type { UnknownException } from "effect/Cause";
import { parse as parseUuid } from "uuid";
import { z } from "zod";
import { PriceQuoteRequestSchema } from "#/gen-proto/nillion/payments/v1/quote_pb";
import type { SignedReceipt } from "#/gen-proto/nillion/payments/v1/receipt_pb";
import {
  type OverwritePermissionsRequest,
  OverwritePermissionsRequestSchema,
} from "#/gen-proto/nillion/permissions/v1/overwrite_pb";
import { Permissions as PermissionsService } from "#/gen-proto/nillion/permissions/v1/service_pb";
import { Log } from "#/logger";
import { type PartyId, Uuid } from "#/types/types";
import type { ValuesPermissions } from "#/types/values-permissions";
import { collapse, unwrapExceptionCause } from "#/util";
import type { VmClient } from "#/vm/client";
import type { Operation } from "#/vm/operation/operation";
import { retryGrpcRequestIfRecoverable } from "#/vm/operation/retry-client";

export const OverwritePermissionsConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
  id: Uuid,
  permissions: z.custom<ValuesPermissions>(),
});
export type OverwritePermissionsConfig = z.infer<
  typeof OverwritePermissionsConfig
>;

type NodeRequestOptions = {
  nodeId: PartyId;
  client: Client<typeof PermissionsService>;
  request: OverwritePermissionsRequest;
};

export class OverwritePermissions implements Operation<ValuesPermissions> {
  private constructor(private readonly config: OverwritePermissionsConfig) {}

  async invoke(): Promise<ValuesPermissions> {
    return pipe(
      E.tryPromise(() => this.pay()),
      E.map((receipt) => this.prepareRequestPerNode(receipt)),
      E.flatMap(E.all),
      E.map((requests) =>
        requests.map((request) =>
          retryGrpcRequestIfRecoverable<ValuesPermissions>(
            "OverwritePermissions",
            this.invokeNodeRequest(request),
          ),
        ),
      ),
      E.flatMap((effects) =>
        E.all(effects, { concurrency: this.config.vm.nodes.length }),
      ),
      E.flatMap(collapse),
      E.catchAll(unwrapExceptionCause),
      E.tapBoth({
        onFailure: (e) =>
          E.sync(() => Log("Overwrite permissions failed: %O", e)),
        onSuccess: (permissions) =>
          E.sync(() =>
            Log("Overwrote permissions: %O", permissions.toObject()),
          ),
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
        request: create(OverwritePermissionsRequestSchema, {
          signedReceipt,
          permissions: this.config.permissions.toProto(),
        }),
      }),
    );
  }

  invokeNodeRequest(
    options: NodeRequestOptions,
  ): E.Effect<ValuesPermissions, UnknownException> {
    const { nodeId, client, request } = options;
    return pipe(
      E.tryPromise(() => client.overwritePermissions(request)),
      E.map((_response) => this.config.permissions),
      E.tap((_permissions) =>
        Log(
          `Overwrote permissions: node=${nodeId.toBase64()} values=${this.config.id} `,
        ),
      ),
    );
  }

  private pay(): Promise<SignedReceipt> {
    const {
      id,
      vm: { payer },
    } = this.config;

    return payer.payForOperation(
      create(PriceQuoteRequestSchema, {
        operation: {
          case: "overwritePermissions",
          value: {
            valuesId: parseUuid(id),
          },
        },
      }),
    );
  }

  static new(config: OverwritePermissionsConfig): OverwritePermissions {
    return new OverwritePermissions(config);
  }
}

export class OverwritePermissionsBuilder {
  private _id?: Uuid;
  private _permissions?: ValuesPermissions;
  private constructor(private readonly vm: VmClient) {}

  id(value: Uuid): this {
    this._id = value;
    return this;
  }

  permissions(value: ValuesPermissions): this {
    this._permissions = value;
    return this;
  }

  build(): OverwritePermissions {
    const config = OverwritePermissionsConfig.parse({
      vm: this.vm,
      id: this._id,
      permissions: this._permissions,
    });
    return OverwritePermissions.new(config);
  }

  static init = (vm: VmClient): OverwritePermissionsBuilder =>
    new OverwritePermissionsBuilder(vm);
}
