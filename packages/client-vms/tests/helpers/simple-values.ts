import {
  NadaPrimitiveValue,
  NadaValueType,
  NamedValue,
  StoreId,
} from "@nillion/client-core";
import { strToByteArray } from "@nillion/test-utils";

export interface TestSimpleType {
  type: NadaValueType;
  id: StoreId;
  name: NamedValue;
  expected: NadaPrimitiveValue;
}

export const testSimpleTypes: TestSimpleType[] = [
  {
    type: NadaValueType.enum.SecretInteger,
    id: "" as StoreId,
    name: NamedValue.parse("data"),
    expected: -42,
  },
  {
    type: NadaValueType.enum.SecretInteger,
    id: "" as StoreId,
    name: NamedValue.parse("data"),
    expected: 42,
  },
  {
    type: NadaValueType.enum.SecretIntegerUnsigned,
    id: "" as StoreId,
    name: NamedValue.parse("data"),
    expected: 42n,
  },
  {
    type: NadaValueType.enum.SecretBlob,
    id: "" as StoreId,
    name: NamedValue.parse("data"),
    expected: strToByteArray("Hi blob, I'm data."),
  },
  {
    type: NadaValueType.enum.SecretString,
    id: "" as StoreId,
    name: NamedValue.parse("data"),
    expected: "Hi blob, I'm string.",
  },
];
