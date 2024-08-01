import {
  NadaPrimitiveValue,
  NadaValueType,
  StoreId,
} from "@nillion/client-core";
import { strToByteArray } from "../../fixture/helpers";

export interface TestSimpleType {
  type: NadaValueType;
  id: StoreId;
  expected: Record<string, NadaPrimitiveValue>;
}

export const testSimpleTypes: TestSimpleType[] = [
  {
    type: NadaValueType.enum.SecretInteger,
    id: "" as StoreId,
    expected: { foo: -42 },
  },
  {
    type: NadaValueType.enum.SecretInteger,
    id: "" as StoreId,
    expected: { foo: 42 },
  },
  {
    type: NadaValueType.enum.SecretIntegerUnsigned,
    id: "" as StoreId,
    expected: { bar: 42n },
  },
  {
    type: NadaValueType.enum.SecretBlob,
    id: "" as StoreId,
    expected: { blob: strToByteArray("Hi blob, I'm data.") },
  },
  {
    type: NadaValueType.enum.SecretString,
    id: "" as StoreId,
    expected: { blob: "Hi blob, I'm string." },
  },
];
