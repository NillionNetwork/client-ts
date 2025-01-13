import { create } from "@bufbuild/protobuf";
import { type Client, createClient } from "@connectrpc/connect";
import { Effect as E, pipe } from "effect";
import type { UnknownException } from "effect/Cause";
import { parse as parseUuid } from "uuid";
import { z } from "zod";
import { PriceQuoteRequestSchema } from "#/gen-proto/nillion/payments/v1/quote_pb";
import type { SignedReceipt } from "#/gen-proto/nillion/payments/v1/receipt_pb";
import { Permissions as PermissionsService } from "#/gen-proto/nillion/permissions/v1/service_pb";
import {
  type UpdatePermissionsRequest,
  UpdatePermissionsRequestSchema,
} from "#/gen-proto/nillion/permissions/v1/update_pb";
import { Log } from "#/logger";
import {
  ComputePermissionCommand,
  ComputePermissionCommandBuilder,
} from "#/types/compute-permission-command";
import {
  PermissionCommand,
  PermissionCommandBuilder,
} from "#/types/permission-command";
import { type PartyId, type ProgramId, Uuid } from "#/types/types";
import type { UserId } from "#/types/user-id";
import { collapse, unwrapExceptionCause } from "#/util";
import type { VmClient } from "#/vm/client";
import type { Operation } from "#/vm/operation/operation";
import { retryGrpcRequestIfRecoverable } from "#/vm/operation/retry-client";

export const UpdatePermissionsConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
  id: Uuid,
  retrieve: z.instanceof(PermissionCommand),
  update: z.instanceof(PermissionCommand),
  _delete: z.instanceof(PermissionCommand),
  compute: z.instanceof(ComputePermissionCommand),
});
export type UpdatePermissionsConfig = z.infer<typeof UpdatePermissionsConfig>;

type NodeRequestOptions = {
  nodeId: PartyId;
  client: Client<typeof PermissionsService>;
  request: UpdatePermissionsRequest;
};

export class UpdatePermissions implements Operation<Uuid> {
  private constructor(private readonly config: UpdatePermissionsConfig) {}

  invoke(): Promise<Uuid> {
    return pipe(
      E.tryPromise(() => this.pay()),
      E.map((receipt) => this.prepareRequestPerNode(receipt)),
      E.flatMap(E.all),
      E.map((requests) =>
        requests.map((request) =>
          retryGrpcRequestIfRecoverable<Uuid>(
            "UpdatePermissions",
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
        onFailure: (e) => E.sync(() => Log("Update permissions failed: %O", e)),
        onSuccess: (id) => E.sync(() => Log(`Updated permissions: ${id}`)),
      }),
      E.runPromise,
    );
  }

  prepareRequestPerNode(
    signedReceipt: SignedReceipt,
  ): E.Effect<NodeRequestOptions, UnknownException>[] {
    const retrieve = this.config.retrieve.toProto();
    const update = this.config.update.toProto();
    const _delete = this.config._delete.toProto();
    const compute = this.config.compute.toProto();

    return this.config.vm.nodes.map((node) =>
      E.succeed({
        nodeId: node.id,
        client: createClient(PermissionsService, node.transport),
        request: create(UpdatePermissionsRequestSchema, {
          signedReceipt,
          retrieve,
          update,
          delete: _delete,
          compute,
        }),
      }),
    );
  }

  invokeNodeRequest(
    options: NodeRequestOptions,
  ): E.Effect<Uuid, UnknownException> {
    const { nodeId, client, request } = options;
    return pipe(
      E.tryPromise(() => client.updatePermissions(request)),
      E.map((_response) => this.config.id),
      E.tap((id) =>
        Log(`Updated permissions: node=${nodeId.toBase64()} values=${id} `),
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
          case: "updatePermissions",
          value: {
            valuesId: parseUuid(id),
          },
        },
      }),
    );
  }

  static new(config: UpdatePermissionsConfig): UpdatePermissions {
    return new UpdatePermissions(config);
  }
}

type UpdatePermissionsAsObject = {
  valuesId?: string;
  retrieve: {
    grant: string[];
    revoke: string[];
  };
  update: {
    grant: string[];
    revoke: string[];
  };
  delete: {
    grant: string[];
    revoke: string[];
  };
  compute: {
    grant: Map<string, string[]>;
    revoke: Map<string, string[]>;
  };
};

export class UpdatePermissionsBuilder {
  private _valuesId?: Uuid;
  private _retrieve = PermissionCommandBuilder.init();
  private _update = PermissionCommandBuilder.init();
  private _delete = PermissionCommandBuilder.init();
  private _compute = ComputePermissionCommandBuilder.init();

  private constructor(private readonly vm: VmClient) {}

  valuesId(value: Uuid): this {
    this._valuesId = value;
    return this;
  }

  retrieve(value: PermissionCommandBuilder): this {
    this._retrieve = value;
    return this;
  }

  update(value: PermissionCommandBuilder): this {
    this._update = value;
    return this;
  }

  delete(value: PermissionCommandBuilder): this {
    this._delete = value;
    return this;
  }

  compute(value: ComputePermissionCommandBuilder): this {
    this._compute = value;
    return this;
  }

  grantRetrieve(id: UserId): this {
    this._retrieve.grant(id);
    return this;
  }

  revokeRetrieve(id: UserId): this {
    this._retrieve.revoke(id);
    return this;
  }

  grantUpdate(id: UserId): this {
    this._update.grant(id);
    return this;
  }

  revokeUpdate(id: UserId): this {
    this._update.revoke(id);
    return this;
  }

  grantDelete(id: UserId): this {
    this._delete.grant(id);
    return this;
  }

  revokeDelete(id: UserId): this {
    this._delete.revoke(id);
    return this;
  }

  grantCompute(id: UserId, program: ProgramId): this {
    this._compute.grant(id, program);
    return this;
  }

  revokeCompute(id: UserId, program: ProgramId): this {
    this._compute.revoke(id, program);
    return this;
  }

  toObject(): UpdatePermissionsAsObject {
    return {
      valuesId: this._valuesId,
      retrieve: this._retrieve.toObject(),
      update: this._update.toObject(),
      delete: this._delete.toObject(),
      compute: this._compute.toObject(),
    };
  }

  build(): UpdatePermissions {
    const config = UpdatePermissionsConfig.parse({
      vm: this.vm,
      id: this._valuesId,
      retrieve: this._retrieve.build(),
      update: this._update.build(),
      _delete: this._delete.build(),
      compute: this._compute.build(),
    });
    return UpdatePermissions.new(config);
  }

  static init = (vm: VmClient): UpdatePermissionsBuilder =>
    new UpdatePermissionsBuilder(vm);
}
