import {
  NadaValue,
  NadaValueType,
  StoreId,
  NamedValue,
} from "@nillion/client-core";
import { strToByteArray } from "../../fixture/helpers";

export interface TestNadaType {
  id: StoreId;
  name: NamedValue;
  type: NadaValueType;
  value: NadaValue;
  nextValue: NadaValue;
}

export const testNadaTypes: TestNadaType[] = [
  {
    id: "" as StoreId,
    name: NamedValue.parse("BlobSecret"),
    type: NadaValueType.enum.BlobSecret,
    value: NadaValue.createBlobSecret(strToByteArray("foo then bar...")),
    nextValue: NadaValue.createBlobSecret(strToByteArray("... then baz!")),
  },
  {
    id: "" as StoreId,
    name: NamedValue.parse("IntegerSecret"),
    type: NadaValueType.enum.IntegerSecret,
    value: NadaValue.createIntegerSecret(-42),
    nextValue: NadaValue.createIntegerSecret(102),
  },
  {
    id: "" as StoreId,
    name: NamedValue.parse("IntegerPublic"),
    type: NadaValueType.enum.IntegerPublic,
    value: NadaValue.createIntegerPublic(-107),
    nextValue: NadaValue.createIntegerSecret(1_000),
  },
  {
    id: "" as StoreId,
    name: NamedValue.parse("IntegerSecretUnsigned"),
    type: NadaValueType.enum.IntegerSecretUnsigned,
    value: NadaValue.createIntegerSecretUnsigned(1_000_000_000_000n),
    nextValue: NadaValue.createIntegerSecretUnsigned(1n),
  },
  {
    id: "" as StoreId,
    name: NamedValue.parse("IntegerPublicUnsigned"),
    type: NadaValueType.enum.IntegerPublicUnsigned,
    value: NadaValue.createIntegerPublicUnsigned(10_000_000_000n),
    nextValue: NadaValue.createIntegerPublicUnsigned(10_000_000_001n),
  },
];
