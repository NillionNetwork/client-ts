import { z } from "zod";

import {
  Compute,
  ComputeArgs,
  ComputeRetrieveResult,
  ComputeRetrieveResultsArgs,
} from "./compute";
import { ProgramStore, ProgramStoreArgs } from "./program";
import {
  FetchAclArgs,
  FetchStoreAcl,
  SetAclArgs,
  SetStoreAcl,
} from "./store-acl";
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
  // free
  "ComputeRetrieveResult",
  "ValuesDelete",

  // paid
  "Compute",
  "FetchStoreAcl",
  "SetStoreAcl",
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
  fetchAcl: (args: FetchAclArgs) => new FetchStoreAcl(args),
  fetchValue: (args: ValueRetrieveArgs) => new ValueRetrieve(args),
  setAcl: (args: SetAclArgs) => new SetStoreAcl(args),
  storeProgram: (args: ProgramStoreArgs) => new ProgramStore(args),
  storeValues: (args: ValuesStoreArgs) => new ValuesStore(args),
  updateValues: (args: ValuesUpdateArgs) => new ValuesUpdate(args),
};
