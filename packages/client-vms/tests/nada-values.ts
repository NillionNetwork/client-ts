import {
  NadaValue,
  NadaValueType,
  StoreId,
  NamedValue,
} from "@nillion/client-core";
import { strToByteArray } from "../../test-utils";

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
    name: NamedValue.parse("SecretBlob"),
    type: NadaValueType.enum.SecretBlob,
    value: NadaValue.createSecretBlob(strToByteArray("foo then bar...")),
    nextValue: NadaValue.createSecretBlob(strToByteArray("... then baz!")),
  },
  {
    id: "" as StoreId,
    name: NamedValue.parse("SecretInteger"),
    type: NadaValueType.enum.SecretInteger,
    value: NadaValue.createSecretInteger(-42),
    nextValue: NadaValue.createSecretInteger(102),
  },
  {
    id: "" as StoreId,
    name: NamedValue.parse("PublicInteger"),
    type: NadaValueType.enum.PublicInteger,
    value: NadaValue.createPublicInteger(-107),
    nextValue: NadaValue.createSecretInteger(1_000),
  },
  {
    id: "" as StoreId,
    name: NamedValue.parse("SecretIntegerUnsigned"),
    type: NadaValueType.enum.SecretIntegerUnsigned,
    value: NadaValue.createSecretIntegerUnsigned(1_000_000_000_000n),
    nextValue: NadaValue.createSecretIntegerUnsigned(1n),
  },
  {
    id: "" as StoreId,
    name: NamedValue.parse("PublicIntegerUnsigned"),
    type: NadaValueType.enum.PublicIntegerUnsigned,
    value: NadaValue.createPublicIntegerUnsigned(10_000_000_000n),
    nextValue: NadaValue.createPublicIntegerUnsigned(10_000_000_001n),
  },
];
