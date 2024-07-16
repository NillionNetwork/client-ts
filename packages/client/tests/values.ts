import { NadaValue, NadaValueType, StoreId, ValueName } from "@nillion/core";
import { strToByteArray } from "../test-helpers";

export type TestType = {
  id: StoreId;
  name: ValueName;
  type: NadaValueType;
  value: NadaValue;
  nextValue: NadaValue;
};

export const testTypes: TestType[] = [
  {
    id: "" as StoreId,
    name: ValueName.parse("BlobSecret"),
    type: NadaValueType.enum.BlobSecret,
    value: NadaValue.createBlobSecret(strToByteArray("foo then bar...")),
    nextValue: NadaValue.createBlobSecret(strToByteArray("... then baz!")),
  },
  {
    id: "" as StoreId,
    name: ValueName.parse("IntegerSecret"),
    type: NadaValueType.enum.IntegerSecret,
    value: NadaValue.createIntegerSecret(-42),
    nextValue: NadaValue.createIntegerSecret(102),
  },
  {
    id: "" as StoreId,
    name: ValueName.parse("IntegerSecretUnsigned"),
    type: NadaValueType.enum.IntegerSecretUnsigned,
    value: NadaValue.createIntegerSecretUnsigned(1_000_000_000_000),
    nextValue: NadaValue.createIntegerSecretUnsigned(1),
  },
  {
    id: "" as StoreId,
    name: ValueName.parse("IntegerPublic"),
    type: NadaValueType.enum.IntegerPublic,
    value: NadaValue.createIntegerPublic(-107),
    nextValue: NadaValue.createIntegerSecret(1_000),
  },
  {
    id: "" as StoreId,
    name: ValueName.parse("IntegerPublicUnsigned"),
    type: NadaValueType.enum.IntegerPublicUnsigned,
    value: NadaValue.createIntegerPublicUnsigned(10_000_000_000),
    nextValue: NadaValue.createIntegerSecret(10_000_000_001),
  },
];
