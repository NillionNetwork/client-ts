import { z } from "zod";

import {
  Compute,
  ComputeArgs,
  FetchComputeOutput,
  FetchComputeOutputArgs,
} from "./compute";
import { StoreProgram, StoreProgramArgs } from "./program";
import {
  FetchAclArgs,
  FetchStoreAcl,
  SetAclArgs,
  SetStoreAcl,
} from "./store-acl";
import {
  DeleteValue,
  DeleteValueArgs,
  FetchValue,
  FetchValueArgs,
  StoreValue,
  StoreValueArgs,
  UpdateValue,
  UpdateValueArgs,
} from "./values";

export interface Operation {
  type: OperationType;
}

export const OperationType = z.enum([
  "StoreProgram",
  "Compute",
  "FetchComputeOutput",

  "StoreValue",
  "FetchValue",
  "UpdateValue",
  "DeleteValue",

  "FetchStoreAcl",
  "SetStoreAcl",
]);
export type OperationType = z.infer<typeof OperationType>;

export const Operation = {
  storeProgram: (args: StoreProgramArgs) => new StoreProgram(args),
  compute: (args: ComputeArgs) => new Compute(args),
  fetchComputeOutput: (args: FetchComputeOutputArgs) =>
    new FetchComputeOutput(args),

  storeValues: (args: StoreValueArgs) => new StoreValue(args),
  fetchValue: (args: FetchValueArgs) => new FetchValue(args),
  updateValues: (args: UpdateValueArgs) => new UpdateValue(args),
  deleteValues: (args: DeleteValueArgs) => new DeleteValue(args),

  fetchAcl: (args: FetchAclArgs) => new FetchStoreAcl(args),
  setAcl: (args: SetAclArgs) => new SetStoreAcl(args),
};
