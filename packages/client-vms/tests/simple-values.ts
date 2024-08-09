import {
  NadaPrimitiveValue,
  NadaValueType,
  StoreId,
} from "@nillion/client-core";
import { strToByteArray } from "../../test-utils";

export interface TestSimpleType {
  type: NadaValueType;
  id: StoreId;
  expected: NadaPrimitiveValue;
}

export const testSimpleTypes: TestSimpleType[] = [
  {
    type: NadaValueType.enum.SecretInteger,
    id: "" as StoreId,
    expected: -42,
  },
  {
    type: NadaValueType.enum.SecretInteger,
    id: "" as StoreId,
    expected: 42,
  },
  {
    type: NadaValueType.enum.SecretIntegerUnsigned,
    id: "" as StoreId,
    expected: 42n,
  },
  {
    type: NadaValueType.enum.SecretBlob,
    id: "" as StoreId,
    expected: strToByteArray("Hi blob, I'm data."),
  },
  {
    type: NadaValueType.enum.SecretString,
    id: "" as StoreId,
    expected: "Hi blob, I'm string.",
  },
];
