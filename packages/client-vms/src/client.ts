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
import { Effect as E, pipe } from "effect";
import { UnknownException } from "effect/Cause";
import { Log } from "./logger";
import {
  NillionClientConfig,
  NillionClientConfigComplete,
  StoreValueArgs,
} from "./types";
import { ZodError } from "zod";
import { valuesRecordToNadaValues } from "./nada";

export class NillionClient {
  private _vm: VmClient | undefined;
  private _chain: PaymentsClient | undefined;

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

  connect(): Promise<boolean> {
    if (this.ready) {
      Log("NillionClient is already connected. Ignoring connect().");
      return Promise.resolve(this.ready);
    }

    return E.Do.pipe(
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
          return this.ready;
        }),
      ),
      E.mapError((error) => {
        if (error instanceof ZodError) {
          Log("Config parse error: %O", error.format());
        } else {
          Log("Connection failed: %O", error);
        }
        E.dieMessage("Invalid configuration");
      }),
      E.runPromise,
    );
  }

  disconnect(): void {
    // TODO(tim): terminate websocket connections / tell worker to terminate / cleanup
    Log("Disconnect called. This is currently a noop.");
  }

  async store(args: {
    values: Record<NamedValue | string, NadaPrimitiveValue | StoreValueArgs>;
    ttl: Days | number;
    permissions?: Permissions;
  }): Promise<Result<StoreId, UnknownException>> {
    return E.Do.pipe(
      E.bind("values", () => valuesRecordToNadaValues(args.values)),
      E.flatMap(({ values }) =>
        E.tryPromise(() =>
          this.storeValues({
            values,
            ttl: args.ttl as Days,
            permissions: args.permissions,
          }),
        ),
      ),
      E.runPromise,
    );
  }

  fetch(args: {
    id: StoreId | string;
    name: NamedValue | string;
    type: NadaValueType;
  }): Promise<Result<Record<string, NadaPrimitiveValue>, UnknownException>> {
    return E.Do.pipe(
      E.bind("id", () => E.try(() => StoreId.parse(args.id))),
      E.bind("name", () => E.try(() => NamedValue.parse(args.name))),
      E.bind("type", () => E.try(() => NadaValueType.parse(args.type))),
      E.flatMap(({ id, name, type }) =>
        E.tryPromise(async () => {
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
          return { [name]: result.ok };
        }),
      ),
      effectToResultAsync,
    );
  }

  update(args: {
    id: StoreId | string;
    values: Record<NamedValue | string, NadaPrimitiveValue | StoreValueArgs>;
    ttl: Days | number;
  }): Promise<Result<ActionId, UnknownException>> {
    return E.Do.pipe(
      E.bind("id", () => E.try(() => StoreId.parse(args.id))),
      E.bind("ttl", () => E.try(() => Days.parse(args.ttl))),
      E.bind("values", () =>
        E.try(() => {
          const nadaValues = NadaValues.create();
          for (const [key, value] of Object.entries(args.values)) {
            const name = NamedValue.parse(key);
            const args = isObjectLiteral(value)
              ? (value as StoreValueArgs)
              : {
                  secret: true,
                  data: value,
                };

            const nadaValue = NadaValue.fromPrimitive(args);
            nadaValues.insert(name, nadaValue);
          }
          return nadaValues;
        }),
      ),
      E.flatMap((args) => E.tryPromise(() => this.updateValue(args))),
      E.runPromise,
    );
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
      E.mapError((e) => {
        if (e instanceof UnknownException) return e;
        else return new UnknownException(e);
      }),
    );
  }

  runProgram(args: {
    bindings: ProgramBindings;
    values: NadaValues;
    storeIds: (StoreId | string)[];
  }): Promise<Result<ComputeResultId, UnknownException>> {
    return E.Do.pipe(
      E.bind("storeIds", () =>
        E.try(() => args.storeIds.map((id) => StoreId.parse(id))),
      ),
      E.let("operation", ({ storeIds }) =>
        Operation.compute({
          storeIds,
          bindings: args.bindings,
          values: args.values,
        }),
      ),
      E.bind("receipt", (args) => this.pay(args)),
      E.flatMap((args) => this.vm.runProgram(args)),
      effectToResultAsync,
    );
  }

  fetchProgramOutput(args: {
    id: ComputeResultId | string;
  }): Promise<Result<Record<string, NadaPrimitiveValue>, UnknownException>> {
    return E.Do.pipe(
      E.bind("id", () => E.try(() => ComputeResultId.parse(args.id))),
      E.let("operation", ({ id }) => Operation.fetchComputeResult({ id })),
      E.flatMap(({ operation }) =>
        this.vm.fetchRunProgramResult(operation.args),
      ),
      effectToResultAsync,
    );
  }

  deleteValues(args: {
    id: StoreId | string;
  }): Promise<Result<StoreId, UnknownException>> {
    return E.Do.pipe(
      E.bind("id", () => E.try(() => StoreId.parse(args.id))),
      E.flatMap((args) => this.vm.deleteValues(args)),
      effectToResultAsync,
    );
  }

  fetchClusterInfo(): Promise<Result<ClusterDescriptor, UnknownException>> {
    return pipe(this.vm.fetchClusterInfo(), effectToResultAsync);
  }

  fetchOperationQuote(args: {
    operation: IntoWasmQuotableOperation & { type: OperationType };
  }): Promise<Result<PriceQuote, UnknownException>> {
    return pipe(this.vm.fetchOperationQuote(args), effectToResultAsync);
  }

  fetchValue(args: {
    id: StoreId | string;
    name: NamedValue | string;
    type: NadaValueType;
  }): Promise<Result<NadaPrimitiveValue, UnknownException>> {
    return E.Do.pipe(
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
      effectToResultAsync,
    );
  }

  storeProgram(args: {
    name: ProgramName | string;
    program: Uint8Array;
  }): Promise<Result<ProgramId, UnknownException>> {
    return E.Do.pipe(
      E.bind("name", () => E.try(() => ProgramName.parse(args.name))),
      E.let("operation", ({ name }) =>
        Operation.storeProgram({ name, program: args.program }),
      ),
      E.bind("receipt", ({ operation }) => this.pay({ operation })),
      E.flatMap((args) => this.vm.storeProgram(args)),
      effectToResultAsync,
    );
  }

  storeValues(args: {
    values: NadaValues;
    ttl?: Days;
    permissions?: Permissions;
  }): Promise<Result<StoreId, UnknownException>> {
    return E.Do.pipe(
      E.bind("ttl", () => E.try(() => Days.parse(args.ttl))),
      E.let("operation", ({ ttl }) =>
        Operation.storeValues({
          values: args.values,
          ttl,
          permissions: args.permissions,
        }),
      ),
      E.bind("receipt", (args) => this.pay(args)),
      E.flatMap((args) => this.vm.storeValues(args)),
      effectToResultAsync,
    );
  }

  updateValue(args: {
    id: StoreId;
    values: NadaValues;
    ttl: Days;
  }): Promise<Result<ActionId, UnknownException>> {
    return E.Do.pipe(
      E.let("operation", () => Operation.updateValues(args)),
      E.bind("receipt", (args) => this.pay(args)),
      E.flatMap((args) => this.vm.updateValues(args)),
      effectToResultAsync,
    );
  }

  fetchPermissions(args: {
    id: StoreId | string;
  }): Promise<Result<Permissions, UnknownException>> {
    return E.Do.pipe(
      E.bind("id", () => E.try(() => StoreId.parse(args.id))),
      E.let("operation", ({ id }) => Operation.fetchPermissions({ id })),
      E.bind("receipt", ({ operation }) => this.pay({ operation })),
      E.flatMap(({ operation, receipt }) =>
        this.vm.fetchPermissions({ operation, receipt }),
      ),
      effectToResultAsync,
    );
  }

  setPermissions(args: {
    id: StoreId | string;
    permissions: Permissions;
  }): Promise<Result<ActionId, UnknownException>> {
    return E.Do.pipe(
      E.bind("id", () => E.try(() => StoreId.parse(args.id))),
      E.let("operation", ({ id }) =>
        Operation.setPermissions({ id, permissions: args.permissions }),
      ),
      E.bind("receipt", (args) => this.pay(args)),
      E.flatMap((args) => this.vm.setPermissions(args)),
      effectToResultAsync,
    );
  }

  static create = (config: NillionClientConfig) => new NillionClient(config);
}
