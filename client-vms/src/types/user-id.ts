import { create } from "@bufbuild/protobuf";
import { sha256 } from "@noble/hashes/sha2";

import type { PublicKey } from "#/gen-proto/nillion/auth/v1/public_key_pb";
import {
  type UserId as UserIdProto,
  UserIdSchema,
} from "#/gen-proto/nillion/auth/v1/user_pb";

export class UserId {
  constructor(private inner: Uint8Array) {
    if (inner.length !== 20) {
      throw new Error(
        `Expected Uint8Array length to be 20 but it was ${inner.length}`,
      );
    }
  }

  toHex(): string {
    return Array.from(this.inner)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  toProto(): UserIdProto {
    return create(UserIdSchema, { contents: this.inner });
  }

  static fromProto(id: UserIdProto): UserId {
    return new UserId(id.contents);
  }

  static from(key: PublicKey): UserId {
    const hash = sha256(key.contents);
    return new UserId(hash.slice(-20));
  }
}
