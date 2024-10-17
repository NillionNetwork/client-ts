import { create, fromBinary, toBinary } from "@bufbuild/protobuf";
import { timestampDate, timestampFromDate } from "@bufbuild/protobuf/wkt";
import type { Interceptor } from "@connectrpc/connect";
import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha2";
import { randomBytes } from "@noble/hashes/utils";

import {
  PublicKey,
  PublicKeySchema,
  PublicKeyType,
} from "@nillion/client-vms/gen-proto/nillion/auth/v1/public_key_pb";
import {
  SignedToken,
  SignedTokenSchema,
  Token,
  TokenSchema,
} from "@nillion/client-vms/gen-proto/nillion/auth/v1/token_pb";
import { PartyId } from "@nillion/client-vms/types";

const HEADER_NAME_BASE64_AUTH = "x-nillion-token";
const NONCE_LENGTH = 32;
const TOKEN_TTL_IN_SECS = 60;

export const createAuthInterceptor = (
  auth: TokenAuthManager,
  node: PartyId,
): Interceptor => {
  return (next) => async (req) => {
    const headers = new Headers(req.header);

    const token = auth.generateToken(node);
    const signedToken = auth.signToken(token);
    const serialized = auth.serialize(signedToken);

    headers.set(HEADER_NAME_BASE64_AUTH, serialized);

    const authenticatedReq = {
      ...req,
      header: headers,
    };

    return next(authenticatedReq);
  };
};

export class TokenAuthManager {
  public publicKey: PublicKey;

  constructor(public privateKey: Uint8Array) {
    this.publicKey = create(PublicKeySchema, {
      keyType: PublicKeyType.SECP256K1,
      contents: secp256k1.getPublicKey(this.privateKey, true),
    });
  }

  public generateToken(id: PartyId): Token {
    const expires = new Date(Date.now() + TOKEN_TTL_IN_SECS * 1000);
    const expiresAt = timestampFromDate(expires);

    return create(TokenSchema, {
      nonce: randomBytes(NONCE_LENGTH),
      targetIdentity: id.inner,
      expiresAt,
    });
  }

  public signToken(token: Token): SignedToken {
    const serializedToken = toBinary(TokenSchema, token);
    const signature = this.sign(serializedToken);

    return create(SignedTokenSchema, {
      serializedToken,
      publicKey: this.publicKey,
      signature,
    });
  }

  sign(data: Uint8Array): Uint8Array {
    const hash = sha256(data);
    return secp256k1.sign(hash, this.privateKey).toCompactRawBytes();
  }

  public isTokenExpired(token: Token): boolean {
    if (token.expiresAt) {
      const expires = timestampDate(token.expiresAt);
      const now = new Date();
      return expires < now;
    } else {
      return false;
    }
  }

  verify(signed: SignedToken): boolean {
    const signature = secp256k1.Signature.fromCompact(signed.signature);
    const hash = sha256(signed.serializedToken);
    // We only care about token validity from the token manager's perspective and so
    // here we're not verifying against singed.publicKey.contents
    return secp256k1.verify(signature, hash, this.publicKey.contents);
  }

  serialize(signed: SignedToken): string {
    const binary = toBinary(SignedTokenSchema, signed);
    return btoa(String.fromCharCode(...binary));
  }

  deserialize(data: string): SignedToken {
    const bytes = atob(data)
      .split("")
      .map((char) => char.charCodeAt(0));
    const binary = new Uint8Array(bytes);
    return fromBinary(SignedTokenSchema, binary);
  }

  static fromSeed(seed: string): TokenAuthManager {
    const privateKey = sha256(seed);
    return new TokenAuthManager(privateKey);
  }
}
