import {
  ActionId,
  ClusterDescriptor,
  ComputeResultId,
  Days,
  effectToResultAsync,
  IntoWasmQuotableOperation,
  NadaValue,
  NadaValues,
  NadaValueType,
  NadaPrimitiveValue,
  VmClient,
  ConnectionArgs as VmClientConnectionArgs,
  Operation,
  OperationType,
  PaymentReceipt,
  Permissions,
  PriceQuote,
  ProgramBindings,
  ProgramId,
  ProgramName,
  Result,
  StoreId,
  NamedValue,
  isObjectLiteral,
} from "@nillion/core";
import {
  PaymentsClient,
  ConnectionArgs as PaymentsClientConnectionArgs,
} from "@nillion/payments";
import { Effect as E } from "effect";
import { UnknownException } from "effect/Cause";
import { Log } from "./logger";

export class NillionClient {
  private _vm = VmClient.create();
  private _chain = PaymentsClient.create();

  defaults: ClientDefaults = {
    valueTtl: Days.parse(30),
  };

  private constructor(defaults: Partial<ClientDefaults> = {}) {
    this.defaults = {
      ...this.defaults,
      ...defaults,
    };
  }

  public get ready(): boolean {
    return this._vm.ready && this._chain.ready;
  }

  public get vm(): VmClient {
    this.isReadyGuard();
    return this._vm;
  }

  public get chain(): PaymentsClient {
    this.isReadyGuard();
    return this._chain;
  }

  private isReadyGuard(): void | never {
    if (!this.ready)
      throw new Error(
        "NillionClient not ready. Call `await client.connect()`.",
      );
  }

  async connect(args: ConnectionArgs): Promise<boolean> {
    await this._vm.connect(args);
    await this._chain.connect(args);
    return this.ready;
  }

  async store(
    values: Record<string, NadaPrimitiveValue | StoreValueArgs>,
    _options?: StoreOptions,
  ): Promise<Result<StoreId, UnknownException>> {
    const nadaValues = NadaValues.create();
    for (const [key, value] of Object.entries(values)) {
      const name = NamedValue.parse(key);
      const args = isObjectLiteral(value)
        ? (value as StoreValueArgs)
        : {
            secret: true,
            unsigned: false,
            data: value,
          };

      const nadaValue = NadaValue.fromPrimitive(args);
      nadaValues.insert(name, nadaValue);
    }
    return await this.storeValues({
      values: nadaValues,
    });
  }

  async fetch(
    id: string,
    nameAndTypePairs: [string, NadaValueType][],
  ): Promise<Result<Record<string, NadaPrimitiveValue>, UnknownException>> {
    const effect: E.Effect<
      Record<string, NadaPrimitiveValue>,
      UnknownException
    > = E.Do.pipe(
      E.let("id", () => StoreId.parse(id)),
      E.let("nameAndTypePairs", () =>
        nameAndTypePairs.map<[NamedValue, NadaValueType]>(([name, type]) => [
          NamedValue.parse(name),
          NadaValueType.parse(type),
        ]),
      ),
      E.map(({ id, nameAndTypePairs }) =>
        nameAndTypePairs.map(async ([name, type]) => {
          const result = await this.fetchValue({
            id,
            name,
            type,
          });

          if (result.err) {
            Log(
              "Fetch value failed for id=%s name=%s: %O",
              id,
              name,
              result.err,
            );
            throw result.err as Error;
          }

          return [name, result.ok] as [NamedValue, NadaPrimitiveValue];
        }),
      ),
      E.flatMap((promises) => E.tryPromise(() => Promise.all(promises))),
      E.map((results) =>
        results.reduce((acc, [name, value]) => {
          return {
            ...acc,
            [name]: value,
          };
        }, {}),
      ),
    );
    return effectToResultAsync(effect);
  }

  pay(args: {
    operation: IntoWasmQuotableOperation & { type: OperationType };
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
      E.flatMap((args) => this._vm.runProgram(args)),
    );
    return effectToResultAsync(effect);
  }

  fetchRunProgramResult(args: {
    id: ComputeResultId;
  }): Promise<Result<Record<string, NadaPrimitiveValue>, UnknownException>> {
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
      E.flatMap((args) => this._vm.deleteValues(args)),
    );
    return effectToResultAsync(effect);
  }

  fetchClusterInfo(): Promise<Result<ClusterDescriptor, UnknownException>> {
    const effect = this._vm.fetchClusterInfo();
    return effectToResultAsync(effect);
  }

  fetchOperationQuote(args: {
    operation: IntoWasmQuotableOperation & { type: OperationType };
  }): Promise<Result<PriceQuote, UnknownException>> {
    const effect = this._vm.fetchOperationQuote(args);
    return effectToResultAsync(effect);
  }

  fetchValue(args: {
    id: StoreId | string;
    name: NamedValue | string;
    type: NadaValueType;
  }): Promise<Result<NadaPrimitiveValue, UnknownException>> {
    const effect = E.Do.pipe(
      E.bind("id", () => E.try(() => StoreId.parse(args.id))),
      E.bind("name", () => E.try(() => NamedValue.parse(args.name))),
      E.let("operation", ({ id, name }) =>
        Operation.fetchValue({
          id,
          name,
          type: args.type,
        }),
      ),
      E.bind("receipt", (args) => this.pay(args)),
      E.flatMap((args) => this._vm.fetchValue(args)),
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
      E.flatMap((args) => this._vm.storeProgram(args)),
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
      E.flatMap((args) => this._vm.storeValues(args)),
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
      E.flatMap((args) => this._vm.updateValues(args)),
    );
    return effectToResultAsync(effect);
  }

  fetchPermissions(args: {
    id: StoreId;
  }): Promise<Result<unknown, UnknownException>> {
    const effect = E.Do.pipe(
      E.let("operation", () => Operation.fetchPermissions(args)),
      E.bind("receipt", (args) => this.pay(args)),
      E.flatMap((args) => this._vm.fetchPermissions(args)),
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
      E.flatMap((args) => this._vm.setPermissions(args)),
    );
    return effectToResultAsync(effect);
  }

  static create = () => new NillionClient();
}

export interface StoreValueArgs {
  data: NadaPrimitiveValue;
  secret: boolean;
  unsigned: boolean;
}

export interface StoreOptions {
  ttl?: number;
  permissions?: Permissions;
}

export type ConnectionArgs = VmClientConnectionArgs &
  PaymentsClientConnectionArgs;

export interface ClientDefaults {
  valueTtl: Days;
}
