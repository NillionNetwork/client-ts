export function strFromByteArray(value: Uint8Array): string {
  return new TextDecoder("utf-8").decode(value);
}

export function strToByteArray(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

export function bigIntFromByteArray(value: Uint8Array): bigint {
  let hexString = "0x";
  for (let i = value.length - 1; i >= 0; i--) {
    hexString += value[i].toString(16).padStart(2, "0");
  }
  return BigInt(hexString);
}
