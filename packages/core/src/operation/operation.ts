import { z } from "zod";
import { NilVmClient } from "../client";
import { PaymentReceipt, PriceQuote } from "../types";
import {
  ValueRetrieve,
  ValueRetrieveArgs,
  ValuesDelete,
  ValuesDeleteArgs,
  ValuesStore,
  ValuesStoreArgs,
  ValuesUpdate,
  ValuesUpdateArgs,
} from "./values";
import {
  PermissionsRetrieve,
  PermissionsRetrieveArgs,
  PermissionsSet,
  PermissionsSetArgs,
} from "./permissions";
import {
  Compute,
  ComputeArgs,
  ComputeRetrieveResult,
  ComputeRetrieveResultsArgs,
} from "./compute";
import { ProgramStore, ProgramStoreArgs } from "./program";

export interface Operation {
  type: OperationType;
}

export const OperationType = z.enum([
  // non-paid
  "ComputeRetrieveResult",
  "ValuesDelete",

  // paid
  "Compute",
  "PermissionsRetrieve",
  "PermissionsUpdate",
  "ProgramStore",
  "ValueRetrieve",
  "ValuesStore",
  "ValuesUpdate",
]);
export type OperationType = z.infer<typeof OperationType>;

export type ExecuteOperationArgs = {
  vm: NilVmClient;
  chain: {
    pay: (quote: PriceQuote) => Promise<PaymentReceipt>;
  };
};

export const Operation = {
  // non-paid
  computeRetrieveResult: (args: ComputeRetrieveResultsArgs) =>
    new ComputeRetrieveResult(args),
  valuesDelete: (args: ValuesDeleteArgs) => new ValuesDelete(args),

  // paid
  compute: (args: ComputeArgs) => new Compute(args),
  permissionsRetrieve: (args: PermissionsRetrieveArgs) =>
    new PermissionsRetrieve(args),
  permissionsSet: (args: PermissionsSetArgs) => new PermissionsSet(args),
  programStore: (args: ProgramStoreArgs) => new ProgramStore(args),
  valueRetrieve: (args: ValueRetrieveArgs) => new ValueRetrieve(args),
  valuesStore: (args: ValuesStoreArgs) => new ValuesStore(args),
  valuesUpdate: (args: ValuesUpdateArgs) => new ValuesUpdate(args),
};
