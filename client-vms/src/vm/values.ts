import { create, toBinary } from "@bufbuild/protobuf";
import type { PartyShares } from "@nillion/client-wasm";
import {
  EcdsaMessageDigestSchema,
  EcdsaPrivateKeyShareSchema,
  EcdsaPublicKeySchema,
  EcdsaSignatureShareSchema,
  EddsaMessageSchema,
  EddsaPrivateKeyShareSchema,
  EddsaPublicKeySchema,
  EddsaSignatureSchema,
  type NamedValue,
  NamedValueSchema,
  PublicIntegerSchema,
  ShamirShareSchema,
  ShamirSharesBlobSchema,
  StoreIdSchema,
  type Value,
  ValueSchema,
} from "#/gen-proto/nillion/values/v1/value_pb";
import type {
  EncryptedNadaValueRecord,
  EncryptedNadaValuesRecord,
} from "#/types";

export function nadaValuesToProto(
  shares: EncryptedNadaValuesRecord,
): NamedValue[] {
  const namedValues: NamedValue[] = [];
  for (const [name, share] of Object.entries(shares)) {
    const namedValue = create(NamedValueSchema, {
      name,
      value: nadaValueToProto(share),
    });
    namedValues.push(namedValue);
  }
  return namedValues;
}

function nadaValueToProto(nadaValue: EncryptedNadaValueRecord): Value {
  switch (nadaValue.type) {
    case "Integer":
      return create(ValueSchema, {
        value: {
          case: "publicInteger",
          value: create(PublicIntegerSchema, { value: nadaValue.value }),
        },
      });
    case "UnsignedInteger":
      return create(ValueSchema, {
        value: {
          case: "publicUnsignedInteger",
          value: create(PublicIntegerSchema, { value: nadaValue.value }),
        },
      });
    case "Boolean":
      return create(ValueSchema, {
        value: {
          case: "publicBoolean",
          value: create(PublicIntegerSchema, { value: nadaValue.value }),
        },
      });
    case "SecretBlob":
      return create(ValueSchema, {
        value: {
          case: "shamirSharesBlob",
          value: create(ShamirSharesBlobSchema, {
            shares: nadaValue.shares.map((share) =>
              create(ShamirShareSchema, { value: share }),
            ),
            originalSize: BigInt(nadaValue.originalSize),
          }),
        },
      });
    case "ShamirShareInteger":
      return create(ValueSchema, {
        value: {
          case: "shamirShareInteger",
          value: create(ShamirShareSchema, { value: nadaValue.value }),
        },
      });
    case "ShamirShareUnsignedInteger":
      return create(ValueSchema, {
        value: {
          case: "shamirShareUnsignedInteger",
          value: create(ShamirShareSchema, { value: nadaValue.value }),
        },
      });
    case "ShamirShareBoolean":
      return create(ValueSchema, {
        value: {
          case: "shamirShareBoolean",
          value: create(ShamirShareSchema, { value: nadaValue.value }),
        },
      });
    case "EcdsaPrivateKey":
      return create(ValueSchema, {
        value: {
          case: "ecdsaPrivateKeyShare",
          value: create(EcdsaPrivateKeyShareSchema, {
            i: Number.parseInt(nadaValue.i),
            x: nadaValue.x,
            sharedPublicKey: nadaValue.sharedPublicKey,
            publicShares: nadaValue.publicShares,
          }),
        },
      });
    case "EcdsaDigestMessage":
      return create(ValueSchema, {
        value: {
          case: "ecdsaMessageDigest",
          value: create(EcdsaMessageDigestSchema, { digest: nadaValue.digest }),
        },
      });
    case "EcdsaSignature":
      return create(ValueSchema, {
        value: {
          case: "ecdsaSignatureShare",
          value: create(EcdsaSignatureShareSchema, {
            r: nadaValue.r,
            sigma: nadaValue.sigma,
          }),
        },
      });
    case "EddsaPublicKey":
      return create(ValueSchema, {
        value: {
          case: "eddsaPublicKey",
          value: create(EddsaPublicKeySchema, {
            publicKey: nadaValue.publicKey,
          }),
        },
      });
    case "EddsaPrivateKey":
      return create(ValueSchema, {
        value: {
          case: "eddsaPrivateKeyShare",
          value: create(EddsaPrivateKeyShareSchema, {
            i: Number.parseInt(nadaValue.i),
            x: nadaValue.x,
            sharedPublicKey: nadaValue.sharedPublicKey,
            publicShares: nadaValue.publicShares,
          }),
        },
      });
    case "EddsaMessage":
      return create(ValueSchema, {
        value: {
          case: "eddsaMessage",
          value: create(EddsaMessageSchema, { message: nadaValue.message }),
        },
      });
    case "EddsaSignature":
      return create(ValueSchema, {
        value: {
          case: "eddsaSignature",
          value: create(EddsaSignatureSchema, {
            signature: nadaValue.signature,
          }),
        },
      });
    case "EcdsaPublicKey":
      return create(ValueSchema, {
        value: {
          case: "ecdsaPublicKey",
          value: create(EcdsaPublicKeySchema, {
            publicKey: nadaValue.publicKey,
          }),
        },
      });
    case "StoreId":
      return create(ValueSchema, {
        value: {
          case: "storeId",
          value: create(StoreIdSchema, {
            storeId: nadaValue.storeId,
          }),
        },
      });
  }
}

export function nadaValuesFromProto(
  values: NamedValue[],
): EncryptedNadaValuesRecord {
  const shares: EncryptedNadaValuesRecord = {};
  for (const namedValue of values) {
    shares[namedValue.name] = nadaValueFromProto(namedValue.value!)!;
  }
  return shares;
}

function nadaValueFromProto(
  value: Value,
): EncryptedNadaValueRecord | undefined {
  switch (value.value.case) {
    case "publicInteger":
      return { type: "Integer", value: value.value.value.value };
    case "publicUnsignedInteger":
      return { type: "UnsignedInteger", value: value.value.value.value };
    case "publicBoolean":
      return { type: "Boolean", value: value.value.value.value };
    case "shamirSharesBlob":
      return {
        type: "SecretBlob",
        shares: value.value.value.shares.map((share) => share.value),
        originalSize: value.value.value.originalSize.toString(),
      };
    case "shamirShareInteger":
      return { type: "ShamirShareInteger", value: value.value.value.value };
    case "shamirShareUnsignedInteger":
      return {
        type: "ShamirShareUnsignedInteger",
        value: value.value.value.value,
      };
    case "shamirShareBoolean":
      return { type: "ShamirShareBoolean", value: value.value.value.value };
    case "ecdsaMessageDigest":
      return { type: "EcdsaDigestMessage", digest: value.value.value.digest };
    case "ecdsaPrivateKeyShare":
      return {
        type: "EcdsaPrivateKey",
        i: value.value.value.i.toString(),
        x: value.value.value.x,
        sharedPublicKey: value.value.value.sharedPublicKey,
        publicShares: value.value.value.publicShares,
      };
    case "ecdsaSignatureShare":
      return {
        type: "EcdsaSignature",
        r: value.value.value.r,
        sigma: value.value.value.sigma,
      };
    case "ecdsaPublicKey":
      return {
        type: "EcdsaPublicKey",
        publicKey: value.value.value.publicKey,
      };
    case "eddsaMessage":
      return { type: "EddsaMessage", message: value.value.value.message };
    case "eddsaPrivateKeyShare":
      return {
        type: "EddsaPrivateKey",
        i: value.value.value.i.toString(),
        x: value.value.value.x,
        sharedPublicKey: value.value.value.sharedPublicKey,
        publicShares: value.value.value.publicShares,
      };
    case "eddsaSignature":
      return {
        type: "EddsaSignature",
        signature: value.value.value.signature,
      };
    case "eddsaPublicKey":
      return {
        type: "EddsaPublicKey",
        publicKey: value.value.value.publicKey,
      };
    case "storeId":
      return {
        type: "StoreId",
        storeId: value.value.value.storeId,
      };
  }
}

export function computeValuesSize(partyShares: PartyShares[]): bigint {
  if (partyShares.length <= 0) {
    throw new Error("Failed to build operation: no nodes");
  }
  const proto_values = nadaValuesToProto(partyShares[0].shares.to_js_object());
  const size = Array.from(proto_values.values())
    .map((value: NamedValue) => {
      return (
        value.name.length +
        (value.value ? toBinary(ValueSchema, value.value).length : 0)
      );
    })
    .reduce((sum, value) => sum + value, 0);
  return BigInt(size);
}
