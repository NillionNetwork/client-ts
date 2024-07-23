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
    type: NadaValueType.enum.IntegerSecret,
    id: "" as StoreId,
    expected: { foo: -42 },
  },
  {
    type: NadaValueType.enum.IntegerSecret,
    id: "" as StoreId,
    expected: { foo: 42 },
  },
  {
    type: NadaValueType.enum.IntegerSecretUnsigned,
    id: "" as StoreId,
    expected: { bar: 42n },
  },
  {
    type: NadaValueType.enum.BlobSecret,
    id: "" as StoreId,
    expected: { blob: strToByteArray("Hi blob!") },
  },
];
