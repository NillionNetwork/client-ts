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
import { PriceQuoteRequest, PriceQuoteRequestArgs } from "./quote";
import { ProgramStore, ProgramStoreArgs } from "./program";

export const OperationType = z.enum([
  // non-paid
  "ClusterInfoRetrieve",
  "ComputeRetrieveResult",
  "PriceQuoteRequest",
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

export abstract class Operation {
  // non-paid
  static clusterDescriptorRetrieve = (args: ClusterDescriptorRetrieveArgs) =>
    new ClusterDescriptorRetrieve(args);
  static computeRetrieveResult = (args: ComputeRetrieveResultsArgs) =>
    new ComputeRetrieveResult(args);
  static priceQuoteRequest = (args: PriceQuoteRequestArgs) =>
    new PriceQuoteRequest(args);
  static valuesDelete = (args: ValuesDeleteArgs) => new ValuesDelete(args);

  // paid
  static compute = (args: ComputeArgs) => new Compute(args);
  static permissionsRetrieve = (args: PermissionsRetrieveArgs) =>
    new PermissionsRetrieve(args);
  static permissionsUpdate = (args: PermissionsUpdateArgs) =>
    new PermissionsUpdate(args);
  static programStore = (args: ProgramStoreArgs) => new ProgramStore(args);
  static valueRetrieve = (args: ValueRetrieveArgs) => new ValueRetrieve(args);
  static valuesStore = (args: ValuesStoreArgs) => new ValuesStore(args);
  static valuesUpdate = (args: ValuesUpdateArgs) => new ValuesUpdate(args);
}
