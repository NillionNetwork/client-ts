"use client";

import { useNilStoreValues } from "@nillion/client-react-hooks";
import { NadaValue } from "@nillion/client-vms";
import { secp256k1 } from "@noble/curves/secp256k1";
import { sha256 } from "@noble/hashes/sha2";
import { bytesToHex } from "@noble/hashes/utils";
import type { FC } from "react";

export const StoreSignatureValues: FC = () => {
  const storeValuesMutation = useNilStoreValues();

  let id = "";
  if (storeValuesMutation.isSuccess) {
    id = storeValuesMutation.data;
  } else if (storeValuesMutation.isError) {
    id = storeValuesMutation.error.message;
  }

  const privateKey: Uint8Array = secp256k1.utils.randomPrivateKey();
  const digestMessage = sha256("A deep message with a deep number: 42");

  const options = {
    values: [
      {
        name: "tecdsa_private_key",
        value: NadaValue.new_ecdsa_private_key(privateKey),
      },
      {
        name: "tecdsa_digest_message",
        value: NadaValue.new_ecdsa_digest_message(digestMessage),
      },
    ],
    ttl: 1,
  };

  const stringifiedOptions = JSON.stringify({
    ...options,
    values: options.values.map(({ name, value }) => ({
      name,
      value: {
        type: value.type_name(),
        value: bytesToHex(value.to_byte_array()),
      },
    })),
  });

  function handleClick(): void {
    storeValuesMutation.execute(options);
  }

  return (
    <div>
      <h2>Store Signature Values</h2>
      <ol>
        <li>Status: {storeValuesMutation.status}</li>
        <li>Options: {stringifiedOptions}</li>
        <li>Store Id: {id}</li>
      </ol>
      <button type="button" onClick={handleClick}>
        Execute
      </button>
    </div>
  );
};
