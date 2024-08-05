import {
  ActionId,
  ClusterDescriptor,
  ComputeResultId,
  Days,
  effectToResultAsync,
  IntoWasmQuotableOperation,
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

/**
 * NillionClient integrates {@link VmClient} and {@link PaymentsClient} to provide
 * a single ergonomic API for interacting with a [Nillion Network](https://docs.nillion.com/network).
 *
 * @example
 * ```ts
 * declare const config: NillionClientConfig
 * const client = NillionClient.create(config)
 * await client.connect()
 *
 * const response = await client.store({
 *  values: { foo: 42 },
 *  ttl: 1,
 * })
 *
 * if(response.ok) {
 *    const storeId = response.ok
 *    localStorage.storeIds = storeId
 * }
 * ```
 */
export class NillionClient {
  private _vm: VmClient | undefined;
  private _chain: PaymentsClient | undefined;

  /**
   * The constructor is private to enforces the use of the factory creator method.
   *
   * @see NillionClient.create
   * @param _config - The configuration object for the NillionClient.
   */
  private constructor(private _config: NillionClientConfig) {}

  /**
   * Whether the client is ready to execute operations.
   *
   * @returns true if both the VM and Payments clients are ready; otherwise, false.
   */
  public get ready(): boolean {
    return (this._vm?.ready && this._chain?.ready) ?? false;
  }

  /**
   * Guarded access to the vm client.
   *
   * @throws Error if the client is not ready.
   * @returns The initialized {@link VmClient} instance.
   */
  public get vm(): VmClient {
    this.isReadyGuard();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._vm!;
  }

  /**
   * Guarded access to the payments client.
   *
   * @throws Error if the client is not ready.
   * @returns The initialized {@link PaymentsClient} instance.
   */
  public get chain(): PaymentsClient {
    this.isReadyGuard();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._chain!;
  }

  /**
   * This guards against access before initialization. NillionClient creation is sync,
   * but PaymentClient and VmClient instantiation are async.
   *
   * @throws Error with message indicating the client is not ready.
   */
  private isReadyGuard(): void | never {
    if (!this.ready) {
      const message = "NillionClient not ready. Call `await client.connect()`.";
      Log(message);
      throw new Error(message);
    }
  }

  /**
   * Connect parses the provided config, initializes the PaymentsClient and VmClient,
   * and then validates connections by querying the nilchain address and the Network's
   * cluster descriptor.
   *
   * This method must be called before the client is used; subsequent calls are ignored.
   *
   * @returns A promise that resolves to true if the connection is successfully established.
   */
  connect(): Promise<boolean> {
    if (this.ready) {
      Log("NillionClient is already connected. Ignoring connect().");
      return Promise.resolve(this.ready);
    }

    return E.Do.pipe(
      E.bind("network", () =>
        E.try(() => {
          const name = this._config.network ?? NamedNetwork.enum.Photon;
          return NamedNetwork.parse(name, {
            path: ["client.connect", "NamedNetwork"],
          });
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
      E.flatMap((config: NillionClientConfigComplete) =>
        E.tryPromise(async () => {
          this._vm = VmClient.create(config);
          this._chain = PaymentsClient.create(config);
          await this._vm.connect();
          await this._chain.connect();

          if (config.logging) globalThis.__NILLION?.enableLogging();
          else globalThis.__NILLION?.disableLogging();

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

  /**
   * Disconnects the client. This function is a no-op and serves as a placeholder.
   */
  disconnect(): void {
    // TODO(tim): terminate websocket connections / tell worker to terminate / cleanup
    Log("Disconnect called. This is currently a noop.");
  }

  /**
   * Stores values in the network. This function is friendlier than manually
   * composing {@link NadaValues} from {@link NadaValue} because it takes care
   * of converting from a key to primitive values map to Nada types automatically.
   *
   * @example
   * ```ts
   * declare client: NillionClient
   *
   * const id = await client.store({
   *  values: {
   *    foo: 42,
   *    bar: "hello",
   *  },
   *  ttl: 2 // 2 days,
   *  permissions: Permissions.createDefaultForUser(client.vm.userId),
   * })
   * ```
   *
   * @see NillionClient.storeValues
   * @param args - An object defining values, time-to-live and optional permissions.
   * @returns A promise resolving to the {@link Result} of the store operation.
   */
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

  /**
   * Retrieves a named Nada value from the network and de-serializes it as a
   * native JS primitive value. This method is friendlier that NillionClient.fetchValue
   * because it accepts and returns primitive values.
   *
   * @example
   * ```ts
   * declare client: NillionClient
   *
   * const response = await client.fetch({ id, name: "foo", type: "SecretInteger" })
   *
   * if(response.ok) {
   *    const value = response.ok
   * }
   * ```
   *
   * @param args - An object defining the store id, value name and the deserialization type.
   * @returns A promise resolving to the {@link Result} of the fetch operation.
   */
  fetch(args: {
    id: StoreId | string;
    name: NamedValue | string;
    type: NadaValueType;
  }): Promise<Result<NadaPrimitiveValue, UnknownException>> {
    return E.Do.pipe(
      E.bind("id", () =>
        E.try(() =>
          StoreId.parse(args.id, { path: ["client.fetch", "args.id"] }),
        ),
      ),
      E.bind("name", () =>
        E.try(() =>
          NamedValue.parse(args.name, { path: ["client.fetch", "args.name"] }),
        ),
      ),
      E.bind("type", () =>
        E.try(() =>
          NadaValueType.parse(args.type, {
            path: ["client.fetch", "args.type"],
          }),
        ),
      ),
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
          return result.ok.data;
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
      E.bind("id", () =>
        E.try(() =>
          StoreId.parse(args.id, { path: ["client.update", "args.id"] }),
        ),
      ),
      E.bind("ttl", () =>
        E.try(() =>
          Days.parse(args.ttl, { path: ["client.update", "args.ttl"] }),
        ),
      ),
      E.bind("values", () => valuesRecordToNadaValues(args.values)),
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
        E.try(() =>
          args.storeIds.map((id) =>
            StoreId.parse(id, { path: ["client.runProgram", "args.ids.id"] }),
          ),
        ),
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
      E.bind("id", () =>
        E.try(() =>
          ComputeResultId.parse(args.id, {
            path: ["client.fetchProgramOutput", "args.id"],
          }),
        ),
      ),
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
      E.bind("id", () =>
        E.try(() =>
          StoreId.parse(args.id, { path: ["client.deleteValues", "args.id"] }),
        ),
      ),
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
    id: StoreId;
    name: NamedValue;
    type: NadaValueType;
  }): Promise<Result<NadaValue, UnknownException>> {
    return E.Do.pipe(
      E.bind("id", () =>
        E.try(() =>
          StoreId.parse(args.id, { path: ["client.fetchValue", "args.id"] }),
        ),
      ),
      E.bind("name", () =>
        E.try(() =>
          NamedValue.parse(args.name, {
            path: ["client.fetchValue", "args.name"],
          }),
        ),
      ),
      E.let("operation", ({ id, name }) =>
        Operation.fetchValue({
          id,
          name,
          type: args.type,
        }),
      ),
      E.bind("receipt", (args) => this.pay(args)),
      E.flatMap((args) => this.vm.fetchValue(args)),
      effectToResultAsync,
    );
  }

  storeProgram(args: {
    name: ProgramName | string;
    program: Uint8Array;
  }): Promise<Result<ProgramId, UnknownException>> {
    return E.Do.pipe(
      E.bind("name", () =>
        E.try(() =>
          ProgramName.parse(args.name, {
            path: ["client.storeProgram", "args.name"],
          }),
        ),
      ),
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
    ttl: Days;
    permissions?: Permissions;
  }): Promise<Result<StoreId, UnknownException>> {
    return E.Do.pipe(
      E.bind("ttl", () =>
        E.try(() =>
          Days.parse(args.ttl, {
            path: ["client.storeValues", "args.ttl"],
          }),
        ),
      ),
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
      E.bind("id", () =>
        E.try(() =>
          StoreId.parse(args.id, {
            path: ["client.fetchPermissions", "args.id"],
          }),
        ),
      ),
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
      E.bind("id", () =>
        E.try(() =>
          StoreId.parse(args.id, { path: ["setPermissions", "args.id"] }),
        ),
      ),
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
