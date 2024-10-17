import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import { timestampFromDate } from "@bufbuild/protobuf/wkt";
import { describe, it } from "@jest/globals";

import { TokenAuthManager } from "@nillion/client-vms/auth";
import {
  SignedToken,
  TokenSchema,
} from "@nillion/client-vms/gen-proto/nillion/auth/v1/token_pb";
import { PartyId } from "@nillion/client-vms/types";

describe("TokenManager", () => {
  const manager = TokenAuthManager.fromSeed("test");
  const nodeId = PartyId.from(Uint8Array.from([1, 2, 3]));
  const token = create(TokenSchema, {
    nonce: new Uint8Array(32).fill(1),
    targetIdentity: Uint8Array.from([1, 2, 3]),
    expiresAt: timestampFromDate(new Date("2024-10-15T10:00:00.000Z")),
  });
  let signedToken: SignedToken;
  let signature: Uint8Array;
  // From signing and serialising token above with the 'test' seed
  const serialized =
    "Ci8KIAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBEgMBAgMaBgig+ri4BhIlCAESIQJfgZVtWCa619MNrtK1yMmOcgRsHsgyPaM2RFR2GD+3yhpAmbvCdxsuz0If2N+rtASR4CPAerKLNg+hOzZeobXaZ0F/ESGyJ309foWA0WMMhAGe3it3MZk+omJ3I6ZWRiAXtg==";

  it("can generate a token", () => {
    const token = manager.generateToken(nodeId);
    expect(manager.isTokenExpired(token)).toBeFalsy();
    expect(token.targetIdentity).toEqual(nodeId.inner);
  });

  it("can sign a token", () => {
    const data = toBinary(TokenSchema, token);
    signature = manager.sign(data);
    expect(signature).toBeTruthy();
  });

  it("can create a signed token", () => {
    signedToken = manager.signToken(token);
    expect(signedToken.signature).toEqual(signature);
  });

  it("can verify a signed token", () => {
    expect(manager.verify(signedToken)).toBeTruthy();
  });

  it("can serialize as base 64", () => {
    const actual = manager.serialize(signedToken);
    expect(actual).toEqual(serialized);
  });

  it("can deserialize from base 64", () => {
    const actualSignedToken = manager.deserialize(serialized);
    expect(signedToken).toEqual(actualSignedToken);
    expect(manager.verify(actualSignedToken)).toBeTruthy();
  });

  it("can deserialize the inner token", () => {
    const binary = signedToken.serializedToken;
    const actualToken = fromBinary(TokenSchema, binary);

    expect(actualToken.targetIdentity).toEqual(token.targetIdentity);
    expect(actualToken.expiresAt).toEqual(token.expiresAt);
    expect(actualToken.nonce).toEqual(token.nonce);
  });
});
