import {
  ActionId,
  ClusterDescriptor,
  ComputeResultId,
  Days,
  effectToResultAsync,
  IntoWasmQuotableOperation,
  NadaValues,
  NadaValueType,
  NadaWrappedValue,
  NilVmClient,
  Operation,
  PaymentReceipt,
  Permissions,
  ProgramBindings,
  ProgramId,
  ProgramName,
  Result,
  StoreId,
  ValueName,
} from "@nillion/core";
import { NilChainPaymentClient } from "@nillion/payments";
import { Effect as E } from "effect";
import { UnknownException } from "effect/Cause";

export type ClientDefaults = {
  valueTtl: Days;
};

export class NillionClient {
  defaults: ClientDefaults = {
    valueTtl: Days.parse(30),
  };

  private constructor(
    public _vm: NilVmClient,
    public _chain: NilChainPaymentClient,
    defaults: Partial<ClientDefaults> = {},
  ) {
    this.defaults = {
      ...this.defaults,
      ...defaults,
    };
  }

  pay(args: {
    operation: IntoWasmQuotableOperation;
  }): E.Effect<PaymentReceipt, UnknownException> {
    return E.Do.pipe(
      E.bind("quote", () => this._vm.fetchOperationQuote(args)),
      E.bind("hash", ({ quote }) => this._chain.pay(quote)),
      E.map(({ quote, hash }) =>
        PaymentReceipt.parse({
          quote,
          hash,
        }),
      ),
    );
  }

  runProgram(args: {
    bindings: ProgramBindings;
    values: NadaValues;
    storeIds: StoreId[];
  }): Promise<Result<ComputeResultId, UnknownException>> {
    const effect: E.Effect<ComputeResultId, UnknownException> = E.Do.pipe(
      E.let("operation", () => Operation.compute(args)),
      E.bind("receipt", (args) => this.pay(args)),
      E.flatMap(this._vm.runProgram),
    );
    return effectToResultAsync(effect);
  }

  fetchRunProgramResult(args: {
    id: ComputeResultId;
  }): Promise<Result<Map<string, NadaWrappedValue>, UnknownException>> {
    const effect = E.Do.pipe(
      E.let("operation", () => Operation.fetchComputeResult(args)),
      E.flatMap(({ operation }) =>
        this._vm.fetchRunProgramResult(operation.args),
      ),
    );
    return effectToResultAsync(effect);
  }

  deleteValues(args: {
    id: StoreId | string;
  }): Promise<Result<StoreId, UnknownException>> {
    const effect = E.Do.pipe(
      E.bind("id", () => E.try(() => StoreId.parse(args.id))),
      E.flatMap(this._vm.deleteValues),
    );
    return effectToResultAsync(effect);
  }

  fetchClusterInfo(): Promise<Result<ClusterDescriptor, UnknownException>> {
    const effect = this._vm.fetchClusterInfo();
    return effectToResultAsync(effect);
  }

  fetchValue(args: {
    id: StoreId | string;
    name: ValueName | string;
    type: NadaValueType;
  }): Promise<Result<NadaWrappedValue, UnknownException>> {
    const effect = E.Do.pipe(
      E.bind("id", () => E.try(() => StoreId.parse(args.id))),
      E.bind("name", () => E.try(() => ValueName.parse(args.name))),
      E.let("operation", ({ id, name }) =>
        Operation.fetchValue({
          id,
          name,
          type: args.type,
        }),
      ),
      E.bind("receipt", (args) => this.pay(args)),
      E.flatMap(this._vm.fetchValue),
      E.map((nada) => nada.data),
    );
    return effectToResultAsync(effect);
  }

  storeProgram(args: {
    name: ProgramName;
    program: Uint8Array;
  }): Promise<Result<ProgramId, UnknownException>> {
    const effect = E.Do.pipe(
      E.let("operation", () => Operation.storeProgram(args)),
      E.bind("receipt", ({ operation }) => this.pay({ operation })),
      E.flatMap(this._vm.storeProgram),
    );
    return effectToResultAsync(effect);
  }

  storeValues(args: {
    values: NadaValues;
    ttl?: Days;
    permissions?: Permissions;
  }): Promise<Result<StoreId, UnknownException>> {
    const effect = E.Do.pipe(
      E.let("operation", () =>
        Operation.storeValues({
          values: args.values,
          ttl: args.ttl ?? this.defaults.valueTtl,
          permissions: args.permissions,
        }),
      ),
      E.bind("receipt", (args) => this.pay(args)),
      E.flatMap(this._vm.storeValues),
    );
    return effectToResultAsync(effect);
  }

  updateValue(args: {
    id: StoreId;
    values: NadaValues;
    ttl: Days;
  }): Promise<Result<ActionId, UnknownException>> {
    const effect = E.Do.pipe(
      E.let("operation", () => Operation.updateValues(args)),
      E.bind("receipt", (args) => this.pay(args)),
      E.flatMap(this._vm.updateValues),
    );
    return effectToResultAsync(effect);
  }

  fetchPermissions(args: {
    id: StoreId;
  }): Promise<Result<unknown, UnknownException>> {
    const effect = E.Do.pipe(
      E.let("operation", () => Operation.fetchPermissions(args)),
      E.bind("receipt", (args) => this.pay(args)),
      E.flatMap(this._vm.fetchPermissions),
    );
    return effectToResultAsync(effect);
  }

  setPermissions(args: {
    id: StoreId;
    permissions: Permissions;
  }): Promise<Result<ActionId, UnknownException>> {
    const effect = E.Do.pipe(
      E.let("operation", () => Operation.setPermissions(args)),
      E.bind("receipt", (args) => this.pay(args)),
      E.flatMap(this._vm.setPermissions),
    );
    return effectToResultAsync(effect);
  }

  static create(
    nilVm: NilVmClient,
    nilChain: NilChainPaymentClient,
  ): NillionClient {
    return new NillionClient(nilVm, nilChain);
  }
}
