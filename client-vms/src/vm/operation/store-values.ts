import { create } from "@bufbuild/protobuf";
import { type Client, createClient } from "@connectrpc/connect";
import { PriceQuoteRequestSchema } from "@nillion/client-vms/gen-proto/nillion/payments/v1/quote_pb";
import type { SignedReceipt } from "@nillion/client-vms/gen-proto/nillion/payments/v1/receipt_pb";
import { Values } from "@nillion/client-vms/gen-proto/nillion/values/v1/service_pb";
import {
  type StoreValuesRequest,
  StoreValuesRequestSchema,
} from "@nillion/client-vms/gen-proto/nillion/values/v1/store_pb";
import { Log } from "@nillion/client-vms/logger";
import { PartyId, TtlDays, Uuid } from "@nillion/client-vms/types/types";
import {
  type ValuesPermissions,
  ValuesPermissionsBuilder,
} from "@nillion/client-vms/types/values-permissions";
import { collapse } from "@nillion/client-vms/util";
import type { VmClient } from "@nillion/client-vms/vm/client";
import type { Operation } from "@nillion/client-vms/vm/operation/operation";
import { retryGrpcRequestIfRecoverable } from "@nillion/client-vms/vm/operation/retry-client";
import {
  type NadaValue,
  NadaValues,
  compute_values_size,
  encode_values,
} from "@nillion/client-wasm";
import { Effect as E, pipe } from "effect";
import { UnknownException } from "effect/Cause";
import { parse, stringify } from "uuid";
import { z } from "zod";

export const StoreValuesConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
  id: Uuid.nullish(),
  values: z.instanceof(NadaValues),
  ttl: TtlDays,
  permissions: z.custom<ValuesPermissions>(),
});
export type StoreValuesConfig = z.infer<typeof StoreValuesConfig>;

type NodeRequestOptions = {
  nodeId: PartyId;
  client: Client<typeof Values>;
  request: StoreValuesRequest;
};

export class StoreValues implements Operation<Uuid> {
  private constructor(private readonly config: StoreValuesConfig) {}

  invoke(): Promise<Uuid> {
    return pipe(
      E.tryPromise(() => this.pay()),
      E.map((receipt) => this.prepareRequestPerNode(receipt)),
      E.flatMap(E.all),
      E.map((requests) =>
        requests.map((request) =>
          retryGrpcRequestIfRecoverable<Uuid>(
            "StoreValues",
            this.invokeNodeRequest(request),
          ),
        ),
      ),
      E.flatMap((effects) =>
        E.all(effects, { concurrency: this.config.vm.nodes.length }),
      ),
      E.flatMap(collapse),
      E.tapBoth({
        onFailure: (e) => E.sync(() => Log("Values store failed: %O", e)),
        onSuccess: (id) => E.sync(() => Log(`Values stored: ${id}`)),
      }),
      E.runPromise,
    );
  }

  prepareRequestPerNode(
    signedReceipt: SignedReceipt,
  ): E.Effect<NodeRequestOptions, UnknownException>[] {
    const {
      values,
      vm: { nodes, masker },
    } = this.config;

    const permissions = this.config.permissions.toProto();
    const updateIdentifier = this.config.id ? parse(this.config.id) : undefined;

    const shares = masker.mask(values);
    return shares.map((share) => {
      const nodeId = PartyId.from(share.party.to_byte_array());
      const node = nodes.find((n) => n.id.toBase64() === nodeId.toBase64());

      if (!node) {
        return E.fail(
          new UnknownException(
            `Failed to match configured nodes with share's party id:${nodeId}`,
          ),
        );
      }

      return E.succeed({
        nodeId,
        client: createClient(Values, node.transport),
        request: create(StoreValuesRequestSchema, {
          signedReceipt,
          bincodeValues: encode_values(share.shares),
          permissions,
          updateIdentifier,
        }),
      });
    });
  }

  invokeNodeRequest(
    options: NodeRequestOptions,
  ): E.Effect<Uuid, UnknownException> {
    const { nodeId, client, request } = options;
    return pipe(
      E.tryPromise(() => client.storeValues(request)),
      E.map((response) => stringify(response.valuesId)),
      E.tap((id) =>
        Log(`Values stored: node=${nodeId.toBase64()} values=${id}`),
      ),
    );
  }

  private pay(): Promise<SignedReceipt> {
    const {
      ttl: ttlDays,
      values,
      vm: { payer, masker },
    } = this.config;

    const payloadSize = compute_values_size(values);
    const classify = masker.classify_values(values);

    return payer.payForOperation(
      create(PriceQuoteRequestSchema, {
        operation: {
          case: "storeValues",
          value: {
            particlesCount: classify.particles,
            secretSharedCount: classify.shares,
            publicValuesCount: classify.public,
            ttlDays,
            payloadSize,
          },
        },
      }),
    );
  }

  static new(config: StoreValuesConfig): StoreValues {
    return new StoreValues(config);
  }
}

export class StoreValuesBuilder {
  private _id?: Uuid;
  private _ttl?: TtlDays;
  private _permissions?: ValuesPermissions;
  readonly _values = new NadaValues();

  private constructor(private readonly vm: VmClient) {
    this._permissions = ValuesPermissionsBuilder.default(this.vm.id);
  }

  value(name: string, value: NadaValue): this {
    this._values.insert(name, value);
    return this;
  }

  ttl(value: TtlDays): this {
    this._ttl = value;
    return this;
  }

  id(value: Uuid): this {
    this._id = value;
    return this;
  }

  permissions(value: ValuesPermissions): this {
    this._permissions = value;
    return this;
  }

  build(): StoreValues {
    const config = StoreValuesConfig.parse({
      vm: this.vm,
      id: this._id,
      values: this._values,
      ttl: this._ttl,
      permissions: this._permissions,
    });
    return StoreValues.new(config);
  }

  static init = (vm: VmClient) => new StoreValuesBuilder(vm);
}
