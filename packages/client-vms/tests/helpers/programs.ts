import {
  ComputeResultId,
  NadaValue,
  NadaValues,
  PartyName,
  ProgramId,
  StoreId,
  NamedValue,
} from "@nillion/client-core";
import { TestEnv } from "../../../test-utils";

export interface TestProgram {
  name: string;
  id: ProgramId;
  inputParties: PartyName[];
  outputParties: PartyName[];
  valuesToStore: NadaValues[];
  valuesToInput: NadaValues;
  storeIds: StoreId[];
  result: {
    id: ComputeResultId;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expected: any;
  };
}

export const testPrograms: TestProgram[] = [
  {
    name: "simple_shares.nada.bin",
    id: ProgramId.parse(`${TestEnv.programNamespace}/simple_shares.nada.bin`),
    inputParties: [PartyName.parse("Dealer")],
    outputParties: [PartyName.parse("Result")],
    storeIds: [],
    valuesToStore: [
      NadaValues.create()
        .insert(
          NamedValue.parse("I03"),
          NadaValue.createSecretIntegerUnsigned(2877n),
        )
        .insert(
          NamedValue.parse("I04"),
          NadaValue.createSecretIntegerUnsigned(2564n),
        ),
    ],
    valuesToInput: NadaValues.create()
      .insert(
        NamedValue.parse("I00"),
        NadaValue.createSecretIntegerUnsigned(17517n),
      )
      .insert(
        NamedValue.parse("I01"),
        NadaValue.createSecretIntegerUnsigned(5226n),
      )
      .insert(
        NamedValue.parse("I02"),
        NadaValue.createSecretIntegerUnsigned(15981n),
      ),
    result: {
      id: "" as ComputeResultId,
      expected: {
        Add0: 1462969515630n,
      },
    },
  },
  {
    name: "array_new.nada.bin",
    id: ProgramId.parse(`${TestEnv.programNamespace}/array_new.nada.bin`),
    inputParties: [PartyName.parse("Party1")],
    outputParties: [PartyName.parse("Party1")],
    storeIds: [],
    valuesToStore: [
      NadaValues.create()
        .insert(NamedValue.parse("a"), NadaValue.createSecretInteger(42))
        .insert(NamedValue.parse("b"), NadaValue.createSecretInteger(43)),
    ],
    valuesToInput: NadaValues.create(),
    result: {
      id: "" as ComputeResultId,
      expected: {
        my_output: [42n, 43n],
      },
    },
  },
  {
    name: "tuple_new.nada.bin",
    id: ProgramId.parse(`${TestEnv.programNamespace}/tuple_new.nada.bin`),
    inputParties: [PartyName.parse("Party1")],
    outputParties: [PartyName.parse("Party1")],
    storeIds: [],
    valuesToStore: [
      NadaValues.create()
        .insert(NamedValue.parse("a"), NadaValue.createSecretInteger(77))
        .insert(NamedValue.parse("b"), NadaValue.createSecretInteger(54)),
    ],
    valuesToInput: NadaValues.create(),
    result: {
      id: "" as ComputeResultId,
      expected: {
        my_output: [77n, 54n],
      },
    },
  },
];
