import { z } from "zod";

import {
  Compute,
  ComputeArgs,
  ComputeRetrieveResult,
  ComputeRetrieveResultsArgs,
} from "./compute";
import {
  PermissionsRetrieve,
  PermissionsRetrieveArgs,
  PermissionsSet,
  PermissionsSetArgs,
} from "./permissions";
import { ProgramStore, ProgramStoreArgs } from "./program";
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

export const Operation = {
  compute: (args: ComputeArgs) => new Compute(args),
  deleteValues: (args: ValuesDeleteArgs) => new ValuesDelete(args),
  fetchComputeResult: (args: ComputeRetrieveResultsArgs) =>
    new ComputeRetrieveResult(args),
  fetchPermissions: (args: PermissionsRetrieveArgs) =>
    new PermissionsRetrieve(args),
  fetchValue: (args: ValueRetrieveArgs) => new ValueRetrieve(args),
  setPermissions: (args: PermissionsSetArgs) => new PermissionsSet(args),
  storeProgram: (args: ProgramStoreArgs) => new ProgramStore(args),
  storeValues: (args: ValuesStoreArgs) => new ValuesStore(args),
  updateValues: (args: ValuesUpdateArgs) => new ValuesUpdate(args),
};
