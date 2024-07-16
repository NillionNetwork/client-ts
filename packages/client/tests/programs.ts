import {
  ComputeResultId,
  NadaValue,
  NadaValues,
  PartyName,
  ProgramId,
  StoreId,
  ValueName,
} from "@nillion/core";

export type ProgramTest = {
  name: string;
  id: ProgramId;
  inputParties: PartyName[];
  outputParties: PartyName[];
  valuesToStore: NadaValues[];
  valuesToInput: NadaValues;
  storeIds: StoreId[];
  result: {
    id: ComputeResultId;
    expected: object;
  };
};

export const tests: ProgramTest[] = [
  {
    name: "simple_shares",
    id: "" as ProgramId,
    inputParties: [PartyName.parse("Dealer")],
    outputParties: [PartyName.parse("Result")],
    storeIds: [],
    valuesToStore: [
      NadaValues.create()
        .insert(
          ValueName.parse("I03"),
          NadaValue.createIntegerSecretUnsigned(2877),
        )
        .insert(
          ValueName.parse("I04"),
          NadaValue.createIntegerSecretUnsigned(2564),
        ),
    ],
    valuesToInput: NadaValues.create()
      .insert(
        ValueName.parse("I00"),
        NadaValue.createIntegerSecretUnsigned(17517),
      )
      .insert(
        ValueName.parse("I01"),
        NadaValue.createIntegerSecretUnsigned(5226),
      )
      .insert(
        ValueName.parse("I02"),
        NadaValue.createIntegerSecretUnsigned(15981),
      ),
    result: {
      id: "" as ComputeResultId,
      expected: {
        Add0: 1462969515630n,
      },
    },
  },
  {
    name: "array_new",
    id: "" as ProgramId,
    inputParties: [PartyName.parse("Party1")],
    outputParties: [PartyName.parse("Party1")],
    storeIds: [],
    valuesToStore: [
      NadaValues.create()
        .insert(ValueName.parse("I00"), NadaValue.createIntegerSecret(42))
        .insert(ValueName.parse("I01"), NadaValue.createIntegerSecret(43)),
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
    name: "tuple_new",
    id: "" as ProgramId,
    inputParties: [PartyName.parse("Party1")],
    outputParties: [PartyName.parse("Party1")],
    storeIds: [],
    valuesToStore: [
      NadaValues.create()
        .insert(ValueName.parse("I00"), NadaValue.createIntegerSecret(77))
        .insert(ValueName.parse("I01"), NadaValue.createIntegerSecret(54)),
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
