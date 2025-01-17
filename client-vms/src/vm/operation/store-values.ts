import { create } from "@bufbuild/protobuf";
import { type Client, createClient } from "@connectrpc/connect";
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
import { PriceQuoteRequestSchema } from "#/gen-proto/nillion/payments/v1/quote_pb";
import type { SignedReceipt } from "#/gen-proto/nillion/payments/v1/receipt_pb";
import { Values } from "#/gen-proto/nillion/values/v1/service_pb";
import {
  NamedValueSchema,
  ValueSchema,
  NamedValue,
  Value,
  ShamirShareSchema,
  PublicIntegerSchema,
  ShamirSharesBlobSchema,
  EcdsaMessageDigestSchema,
  EcdsaPrivateKeyShareSchema,
  EcdsaSignatureShareSchema,
} from "#/gen-proto/nillion/values/v1/value_pb";
import {
  type StoreValuesRequest,
  StoreValuesRequestSchema,
} from "#/gen-proto/nillion/values/v1/store_pb";
import { Log } from "#/logger";
import { PartyId, TtlDays, Uuid } from "#/types/types";
import {
  type ValuesPermissions,
  ValuesPermissionsBuilder,
} from "#/types/values-permissions";
import { collapse, unwrapExceptionCause } from "#/util";
import type { VmClient } from "#/vm/client";
import type { Operation } from "#/vm/operation/operation";
import { retryGrpcRequestIfRecoverable } from "#/vm/operation/retry-client";

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

export const EncryptedNadaValueRecord = z.discriminatedUnion("type", [
  z.object({ type: z.literal("Integer"), value: z.instanceof(Uint8Array) }),
  z.object({
    type: z.literal("UnsignedInteger"),
    value: z.instanceof(Uint8Array),
  }),
  z.object({ type: z.literal("Boolean"), value: z.instanceof(Uint8Array) }),
  z.object({
    type: z.literal("EcdsaDigestMessage"),
    value: z.instanceof(Uint8Array),
  }),
  z.object({ type: z.literal("SecretBlob"), value: z.instanceof(Uint8Array) }),
  z.object({
    type: z.literal("ShamirShareInteger"),
    value: z.instanceof(Uint8Array),
  }),
  z.object({
    type: z.literal("ShamirShareUnsignedInteger"),
    value: z.instanceof(Uint8Array),
  }),
  z.object({
    type: z.literal("ShamirShareBoolean"),
    value: z.instanceof(Uint8Array),
  }),
  z.object({
    type: z.literal("EcdsaPrivateKey"),
    value: z.instanceof(Uint8Array),
  }),
  z.object({
    type: z.literal("EcdsaSignature"),
    value: z.instanceof(Uint8Array),
  }),
]);
export type EncryptedNadaValueRecord = z.infer<typeof EncryptedNadaValueRecord>;

export const EncryptedNadaValuesRecord = z.record(
  z.string(),
  EncryptedNadaValueRecord,
);
export type EncryptedNadaValuesRecord = z.infer<
  typeof EncryptedNadaValuesRecord
>;

function nada_values_to_proto(shares: EncryptedNadaValuesRecord): NamedValue[] {
  const named_values: NamedValue[] = [];
  for (const [name, share] of Object.entries(shares)) {
    const named_value = create(NamedValueSchema, {
      name,
      value: nada_value_to_proto(share),
    });
    named_values.push(named_value);
  }
  return named_values;
}

function nada_value_to_proto(nada_value: EncryptedNadaValueRecord): Value {
  switch (nada_value.type) {
    case "Integer":
      return create(ValueSchema, {
        value: {
          case: "publicInteger",
          value: create(PublicIntegerSchema, { value: nada_value.value }),
        },
      });
    case "UnsignedInteger":
      return create(ValueSchema, {
        value: {
          case: "publicUnsignedInteger",
          value: create(PublicIntegerSchema, { value: nada_value.value }),
        },
      });
    case "Boolean":
      return create(ValueSchema, {
        value: {
          case: "publicBoolean",
          value: create(PublicIntegerSchema, { value: nada_value.value }),
        },
      });
    case "EcdsaDigestMessage":
      return create(ValueSchema, {
        value: {
          case: "ecdsaMessageDigest",
          value: create(EcdsaMessageDigestSchema, { digest: nada_value.value }), // TODO
        },
      });
    case "SecretBlob":
      return create(ValueSchema, {
        value: {
          case: "shamirSharesBlob",
          value: create(ShamirSharesBlobSchema, {
            shares: nada_value.value,
            originalSize: 0,
          }), // TODO
        },
      });
    case "ShamirShareInteger":
      return create(ValueSchema, {
        value: {
          case: "shamirShareInteger",
          value: create(ShamirShareSchema, { value: nada_value.value }),
        },
      });
    case "ShamirShareUnsignedInteger":
      return create(ValueSchema, {
        value: {
          case: "shamirShareUnsignedInteger",
          value: create(ShamirShareSchema, { value: nada_value.value }),
        },
      });
    case "ShamirShareBoolean":
      return create(ValueSchema, {
        value: {
          case: "shamirShareBoolean",
          value: create(ShamirShareSchema, { value: nada_value.value }),
        },
      });
    case "EcdsaPrivateKey":
      return create(ValueSchema, {
        value: {
          case: "ecdsaPrivateKeyShare",
          value: create(EcdsaPrivateKeyShareSchema, {
            i: 0,
            x: 0,
            sharedPublicKey: 0,
            publicShares: 0,
          }), // TODO
        },
      });
    case "EcdsaSignature":
      return create(ValueSchema, {
        value: {
          case: "ecdsaSignatureShare",
          value: create(EcdsaSignatureShareSchema, { r: 0, sigma: 0 }), // TODO
        },
      });
  }
}

function nada_values_from_proto(
  values: NamedValue[],
): EncryptedNadaValuesRecord {
  const shares: EncryptedNadaValuesRecord = {};
  for (const named_value of values) {
    shares[named_value.name] = nada_value_from_proto(named_value.value!);
  }
  return shares;
}

function nada_value_from_proto(value: Value): EncryptedNadaValueRecord {
  switch (value.value.case) {
    case "publicInteger":
      return { type: "Integer", value: value.value.value };
    case "publicUnsignedInteger":
      return { type: "UnsignedInteger", value: value.value.value };
    case "publicBoolean":
      return { type: "Boolean", value: value.value.value };
    case "ecdsaMessageDigest":
      return { type: "EcdsaDigestMessage", value: value.value.digest };
    case "shamirSharesBlob":
      return { type: "SecretBlob", value: value.value.shares };
    case "shamirShareInteger":
      return { type: "ShamirShareInteger", value: value.value.value };
    case "shamirShareUnsignedInteger":
      return { type: "ShamirShareUnsignedInteger", value: value.value.value };
    case "shamirShareBoolean":
      return { type: "ShamirShareBoolean", value: value.value.value };
    case "ecdsaPrivateKeyShare":
      return { type: "EcdsaPrivateKey", value: value.value.i };
    case "ecdsaSignatureShare":
      return { type: "EcdsaSignature", value: value.value.r };
  }
}

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
      E.catchAll(unwrapExceptionCause),
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
