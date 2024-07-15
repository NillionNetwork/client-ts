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
  PermissionsUpdate,
  PermissionsUpdateArgs,
} from "./permissions";
import {
  Compute,
  ComputeArgs,
  ComputeRetrieveResult,
  ComputeRetrieveResultsArgs,
} from "./compute";
import {
  ClusterDescriptorRetrieve,
  ClusterDescriptorRetrieveArgs,
} from "./cluster";
import { ProgramStore, ProgramStoreArgs } from "./program";

export interface Operation {
  type: OperationType;
}

export const OperationType = z.enum([
  // non-paid
  "ClusterInfoRetrieve",
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

export const isPaidOperation = ({ type }: Operation) =>
  type === OperationType.enum.ClusterInfoRetrieve ||
  type === OperationType.enum.ComputeRetrieveResult ||
  type === OperationType.enum.ValuesDelete;

export type ExecuteOperationArgs = {
  vm: NilVmClient;
  chain: {
    pay: (quote: PriceQuote) => Promise<PaymentReceipt>;
  };
};

export const Operation = {
  // non-paid
  clusterDescriptorRetrieve: (args: ClusterDescriptorRetrieveArgs) =>
    new ClusterDescriptorRetrieve(args),
  computeRetrieveResult: (args: ComputeRetrieveResultsArgs) =>
    new ComputeRetrieveResult(args),
  valuesDelete: (args: ValuesDeleteArgs) => new ValuesDelete(args),

  // paid
  compute: (args: ComputeArgs) => new Compute(args),
  permissionsRetrieve: (args: PermissionsRetrieveArgs) =>
    new PermissionsRetrieve(args),
  permissionsUpdate: (args: PermissionsUpdateArgs) =>
    new PermissionsUpdate(args),
  programStore: (args: ProgramStoreArgs) => new ProgramStore(args),
  valueRetrieve: (args: ValueRetrieveArgs) => new ValueRetrieve(args),
  valuesStore: (args: ValuesStoreArgs) => new ValuesStore(args),
  valuesUpdate: (args: ValuesUpdateArgs) => new ValuesUpdate(args),
};
