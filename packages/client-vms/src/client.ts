import {
  ActionId,
  ClusterDescriptor,
  ComputeResultId,
  Days,
  effectToResultAsync,
  IntoWasmQuotableOperation,
  isObjectLiteral,
  NadaPrimitiveValue,
  NadaValue,
  NadaValues,
  NadaValueType,
  NamedNetwork,
  NamedValue,
  Operation,
  OperationType,
  PartialConfig,
  PaymentReceipt,
  Permissions,
  PriceQuote,
  ProgramBindings,
  ProgramId,
  ProgramName,
  Result,
  StoreId,
  VmClient,
} from "@nillion/client-core";
import { PaymentsClient } from "@nillion/client-payments";
import { Effect as E } from "effect";
import { UnknownException } from "effect/Cause";
import { Log } from "./logger";
import { NillionClientConfig, NillionClientConfigComplete } from "./types";
import { ZodError } from "zod";

export interface Defaults {
  valueTtl: Days;
}

export class NillionClient {
  private _vm: VmClient | undefined;
  private _chain: PaymentsClient | undefined;

  defaults: Defaults = {
    valueTtl: Days.parse(30),
  };

  private constructor(private _config: NillionClientConfig) {}

  public get ready(): boolean {
    return (this._vm?.ready && this._chain?.ready) ?? false;
  }

  public get vm(): VmClient {
    this.isReadyGuard();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._vm!;
  }

  public get chain(): PaymentsClient {
    this.isReadyGuard();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._chain!;
  }

  private isReadyGuard(): void | never {
    if (!this.ready) {
      const message = "NillionClient not ready. Call `await client.connect()`.";
      Log(message);
      throw new Error(message);
    }
  }

  async connect(): Promise<boolean> {
    if (this.ready) {
      Log("NillionClient is already connected. Ignoring connect().");
      return this.ready;
    }

    const effect: E.Effect<void, UnknownException> = E.Do.pipe(
      E.bind("network", () =>
        E.try(() => {
          const name = this._config.network ?? NamedNetwork.enum.Photon;
          return NamedNetwork.parse(name);
        }),
      ),
      E.bind("partial", ({ network }) =>
        E.try(() => {
          let partial: unknown = {};
          if (network != NamedNetwork.enum.Custom) {
            const key = network;
            partial = PartialConfig[key];
          }
          return partial as Partial<NillionClientConfigComplete>;
        }),
      ),
      E.let("seeds", () => {
        const seeds: Record<string, string> = {};
        if (this._config.userSeed) seeds.userSeed = this._config.userSeed;
        if (this._config.nodeSeed) seeds.nodeSeed = this._config.nodeSeed;
        return seeds;
      }),
      E.bind("overrides", () =>
        E.tryPromise(async () =>
          this._config.overrides ? await this._config.overrides() : {},
        ),
      ),
      E.flatMap(({ network, seeds, partial, overrides }) =>
        E.try(() => {
          const complete: unknown = {
            network,
            ...partial,
            ...seeds,
            ...overrides,
          };
          Log("Merged config: %O", complete);
          return NillionClientConfigComplete.parse(complete);
        }),
      ),
      E.flatMap((config) =>
        E.tryPromise(async () => {
          this._vm = VmClient.create(config);
          this._chain = PaymentsClient.create(config);
          await this._vm.connect();
          await this._chain.connect();
          Log("NillionClient connected.");
        }),
      ),
    );

    const result = await effectToResultAsync(effect);
    if (result.err) {
      const { error } = result.err;
      if (error instanceof ZodError) {
        Log("Config parse error: %O", error.format());
      } else {
        Log("Connection failed: %O", error);
      }
      throw error as Error;
    } else {
      Log("Connected");
      return this.ready;
    }
  }

  disconnect(): void {
    // TODO: terminate websocket connections / tell worker to terminate / cleanup
    Log("Disconnect called. This is currently a noop.");
  }

  async store(
    values: Record<string, NadaPrimitiveValue | StoreValueArgs>,
    options?: StoreOptions,
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
      ttl: options?.ttl as Days,
      permissions: options?.permissions,
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
      E.bind("quote", () => this.vm.fetchOperationQuote(args)),
      E.bind("hash", ({ quote }) => this.chain.pay(quote)),
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
      E.flatMap((args) => this.vm.runProgram(args)),
    );
    return effectToResultAsync(effect);
  }

  fetchRunProgramResult(args: {
    id: ComputeResultId;
  }): Promise<Result<Record<string, NadaPrimitiveValue>, UnknownException>> {
    const effect = E.Do.pipe(
      E.let("operation", () => Operation.fetchComputeResult(args)),
      E.flatMap(({ operation }) =>
        this.vm.fetchRunProgramResult(operation.args),
      ),
    );
    return effectToResultAsync(effect);
  }

  deleteValues(args: {
    id: StoreId | string;
  }): Promise<Result<StoreId, UnknownException>> {
    const effect = E.Do.pipe(
      E.bind("id", () => E.try(() => StoreId.parse(args.id))),
      E.flatMap((args) => this.vm.deleteValues(args)),
    );
    return effectToResultAsync(effect);
  }

  fetchClusterInfo(): Promise<Result<ClusterDescriptor, UnknownException>> {
    const effect = this.vm.fetchClusterInfo();
    return effectToResultAsync(effect);
  }

  fetchOperationQuote(args: {
    operation: IntoWasmQuotableOperation & { type: OperationType };
  }): Promise<Result<PriceQuote, UnknownException>> {
    const effect = this.vm.fetchOperationQuote(args);
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
      E.flatMap((args) => this.vm.fetchValue(args)),
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
      E.flatMap((args) => this.vm.storeProgram(args)),
    );
    return effectToResultAsync(effect);
  }

  storeValues(args: {
    values: NadaValues;
    ttl?: Days;
    permissions?: Permissions;
  }): Promise<Result<StoreId, UnknownException>> {
    const effect = E.Do.pipe(
      E.let("ttl", () => Days.parse(args.ttl ?? this.defaults.valueTtl)),
      E.let("operation", ({ ttl }) =>
        Operation.storeValues({
          values: args.values,
          ttl,
          permissions: args.permissions,
        }),
      ),
      E.bind("receipt", (args) => this.pay(args)),
      E.flatMap((args) => this.vm.storeValues(args)),
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
      E.flatMap((args) => this.vm.updateValues(args)),
    );
    return effectToResultAsync(effect);
  }

  fetchPermissions(args: {
    id: StoreId;
  }): Promise<Result<unknown, UnknownException>> {
    const effect = E.Do.pipe(
      E.let("operation", () => Operation.fetchPermissions(args)),
      E.bind("receipt", (args) => this.pay(args)),
      E.flatMap((args) => this.vm.fetchPermissions(args)),
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
      E.flatMap((args) => this.vm.setPermissions(args)),
    );
    return effectToResultAsync(effect);
  }

  static create = (config: NillionClientConfig) => new NillionClient(config);
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
