import { Effect as E, pipe } from "effect";
import { UnknownException } from "effect/Cause";
import { ZodError } from "zod";

import {
  ActionId,
  ClusterDescriptor,
  ComputeOutputId,
  Days,
  effectToResultAsync,
  IntoWasmQuotableOperation,
  NadaPrimitiveValue,
  NadaValue,
  NadaValues,
  NadaValueType,
  NamedValue,
  Operation,
  OperationType,
  PartyId,
  PaymentReceipt,
  PriceQuote,
  ProgramBindings,
  ProgramId,
  ProgramName,
  Result,
  StoreAcl,
  StoreId,
  UserId,
} from "@nillion/client-core";
import { PaymentClientConfig, PaymentsClient } from "@nillion/client-payments";

import { Log } from "./logger";
import { toNadaValues } from "./nada";
import { NilVmClient, NilVmClientConfig } from "./nilvm";
import { NetworkConfig, StoreValueArgs, UserCredentials } from "./types";

/**
 * NillionClient encapsulates {@link NilVmClient} and {@link PaymentsClient} to provide
 * a single API for interacting with a [Nillion Network](https://docs.nillion.com/network).
 *
 * @example
 * ```ts
 * const client = NillionClient.create()
 * client.setNetworkConfig(NamedNetworkConfig.photon)
 * client.setUserCredentials({
 *   userSeed: "unique-user-seed",
 *   signer: "keplr",
 * })
 * await client.connect()
 * ```
 */
export class NillionClient {
  private _vm: NilVmClient | undefined;
  private _chain: PaymentsClient | undefined;
  private _userConfig: UserCredentials | undefined;
  private _networkConfig: NetworkConfig | undefined;

  /**
   * The constructor is private to enforce use of {@link NillionClient.create}.
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {}

  /**
   * If the client is ready to execute operations.
   *
   * @returns true if both the VM and Payments clients are ready; otherwise, false.
   */
  public get ready(): boolean {
    return Boolean(this._userConfig && this._vm?.ready && this._chain?.ready);
  }

  /**
   * Guarded access to the vm client.
   *
   * @throws Error if the client is not ready.
   * @returns The initialized {@link NilVmClient} instance.
   */
  public get vm(): NilVmClient {
    this.isReadyGuard();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._vm!;
  }

  /**
   * Guarded access to the payments' client.
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
   * Set the client's {@link NetworkConfig}.
   *
   * This must be invoked before {@link NillionClient.connect}.
   *
   * @param config - {@link NetworkConfig}
   */
  public setNetworkConfig(config: NetworkConfig) {
    this._networkConfig = NetworkConfig.parse(config);
  }

  /**
   * Get the client's {@link NetworkConfig}.
   *
   */
  public get networkConfig(): NetworkConfig {
    this.isReadyGuard();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._networkConfig!;
  }

  public setUserCredentials(config: UserCredentials) {
    this._userConfig = UserCredentials.parse(config);
  }

  public get userConfig(): UserCredentials {
    this.isReadyGuard();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this._userConfig!;
  }

  public get userId(): UserId {
    return this.vm.userId;
  }

  public get partyId(): PartyId {
    return this.vm.partyId;
  }

  /**
   * This guards against access before initialization. NillionClient creation is sync,
   * but PaymentClient and VmClient instantiation are async.
   *
   * @throws Error with message indicating the client is not ready.
   */
  private isReadyGuard(): void {
    if (!this.ready) {
      const message = "NillionClient not initialiazed.";
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

    return pipe(
      E.tryPromise(async () => {
        const combined = {
          ...this._userConfig,
          ...this._networkConfig,
        };
        Log("Config: %O", combined);

        const nilVmConfig = NilVmClientConfig.parse({
          bootnodes: combined.bootnodes,
          clusterId: combined.clusterId,
          userSeed: combined.userSeed,
          nodeSeed: combined.nodeSeed,
        });

        const signer =
          typeof combined.signer === "function"
            ? await combined.signer()
            : undefined;

        const nilChainConfig = PaymentClientConfig.parse({
          chainId: combined.nilChainId,
          endpoint: combined.nilChainEndpoint,
          signer,
        });

        this._vm = NilVmClient.create(nilVmConfig);
        this._chain = PaymentsClient.create(nilChainConfig);

        await this._vm.connect();
        await this._chain.connect();

        Log("NillionClient connected.");
        return this.ready;
      }),
      E.mapError((error) => {
        if (error instanceof ZodError) {
          Log("Parsing error: %O", error.format());
        } else {
          Log("Connection failed: %O", error);
        }
      }),
      E.runPromise,
    );
  }

  /**
   * Disconnects the client. This function is a no-op and serves as a placeholder.
   */
  disconnect(): Promise<void> {
    this._vm = undefined;
    this._chain = undefined;
    Log("Client disconnected");
    return Promise.resolve();
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
   *  acl: StoreAcl.createDefaultForUser(client.vm.userId),
   * })
   * ```
   *
   * @see NillionClient.storeValues
   * @param args - An object defining values, time-to-live and optional permissions.
   * @returns A promise resolving to the {@link Result} of the store operation.
   */
  async store(args: {
    name: NamedValue | string;
    value: NadaPrimitiveValue | StoreValueArgs;
    ttl: Days | number;
    acl?: StoreAcl;
  }): Promise<Result<StoreId, UnknownException>> {
    return E.Do.pipe(
      E.bind("values", () =>
        toNadaValues({ name: args.name, value: args.value }),
      ),
      E.flatMap(({ values }) =>
        E.tryPromise(() =>
          this.storeValues({
            values,
            ttl: args.ttl as Days,
            acl: args.acl,
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

  /**
   * Updates values at the given store id. Similar to {@link NillionClient.store}, this
   * function takes care of converting from primitive values to Nada types automatically.
   *
   * @param args - An Object with the store id, values and time-to-live.
   * @returns A promise resolving to the update's unique action id in the network.
   * @see NillionClient.updateValue
   */
  update(args: {
    id: StoreId | string;
    name: NamedValue | string;
    value: NadaPrimitiveValue | StoreValueArgs;
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
      E.bind("values", () =>
        toNadaValues({ name: args.name, value: args.value }),
      ),
      E.flatMap((args) => E.tryPromise(() => this.updateValue(args))),
      E.runPromise,
    );
  }

  /**
   * Pay for the operation.
   *
   * Retrieves a quote from the leader, pays for it on nilchian and then returns a {@link PaymentReceipt}.
   *
   * @param args - An object containing the operation and its type.
   * @returns An {@link E.Effect} that resolves to a {@link PaymentReceipt}.
   */
  pay(args: {
    operation: IntoWasmQuotableOperation & { type: OperationType };
  }): E.Effect<PaymentReceipt, UnknownException> {
    return E.Do.pipe(
      E.bind("quote", () => this.vm.fetchOperationQuote(args)),
      E.bind("hash", ({ quote }) => this.chain.pay(quote)),
      E.map(({ quote, hash }) =>
        PaymentReceipt.parse(
          {
            quote,
            hash,
          },
          { path: ["client.pay", "PaymentReceipt"] },
        ),
      ),
      E.mapError((e) => {
        if (e instanceof UnknownException) return e;
        else return new UnknownException(e);
      }),
    );
  }

  /**
   * Invokes the specified program.
   *
   * @param args - An object containing program bindings, run-time values, and ids for values to be retrieved directly from StoreIds.
   * @returns A promise resolving to the {@link ComputeOutputId} which will points to the program's output.
   * @see NillionClient.fetchComputeOutput
   */
  compute(args: {
    bindings: ProgramBindings;
    values: NadaValues;
    storeIds: (StoreId | string)[];
  }): Promise<Result<ComputeOutputId, UnknownException>> {
    return E.Do.pipe(
      E.bind("storeIds", () =>
        E.try(() =>
          args.storeIds.map((id) =>
            StoreId.parse(id, { path: ["client.compute", "args.ids.id"] }),
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
      E.flatMap((args) => this.vm.compute(args)),
      effectToResultAsync,
    );
  }

  /**
   * Fetches the result from a program execution.
   *
   * @param args - An object containing the {@link ComputeOutputId}.
   * @returns A promise resolving to a Map of the program's output.
   * @see NillionClient.compute
   */
  fetchComputeOutput(args: {
    id: ComputeOutputId | string;
  }): Promise<Result<Record<string, NadaPrimitiveValue>, UnknownException>> {
    return E.Do.pipe(
      E.bind("id", () =>
        E.try(() =>
          ComputeOutputId.parse(args.id, {
            path: ["client.fetchComputeOutput", "args.id"],
          }),
        ),
      ),
      E.let("operation", ({ id }) => Operation.fetchComputeOutput({ id })),
      E.flatMap(({ operation }) => this.vm.fetchComputeOutput(operation.args)),
      effectToResultAsync,
    );
  }

  /**
   * Delete the {@link NadaValues} stored at {@link StoreId}.
   *
   * @param args - An object containing the {@link StoreId} to delete.
   * @returns A promise resolving to the deleted {@link StoreId}.
   */
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

  /**
   * Fetch network details.
   *
   * @returns A promise resolving to the network's {@link ClusterDescriptor}.
   */
  fetchClusterInfo(): Promise<Result<ClusterDescriptor, UnknownException>> {
    return pipe(this.vm.fetchClusterInfo(), effectToResultAsync);
  }

  /**
   * Asks the leader to quote the provided operation.
   *
   * @param args - An object containing the {@link Operation}.
   * @returns A promise resolving to the {@link PriceQuote}.
   * @see NillionClient.pay
   */
  fetchOperationQuote(args: {
    operation: IntoWasmQuotableOperation & { type: OperationType };
  }): Promise<Result<PriceQuote, UnknownException>> {
    return pipe(this.vm.fetchOperationQuote(args), effectToResultAsync);
  }

  /**
   * Fetch the {@link NamedValue} at {@link StoreId}.
   *
   * @param args - An object containing the {@link StoreId}, {@link NamedValue} and {@link NadaValueType}.
   * @returns A promise resolving to the {@link Result} containing a `Map` where the keys are {@link NamedValue} and the values are {@link NadaValue}.
   */
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

  /**
   * Store a program in the network.
   *
   * @param args - An object containing the {@link ProgramName} and the program as a {@link Uint8Array}.
   * @returns A promise resolving to the {@link Result} containing the {@link ProgramId}.
   */
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

  /**
   * Stores {@link NadaValues} in the network.
   *
   * @param args - An object containing the values, time-to-live, and optional permissions.
   * @returns A promise resolving to the {@link Result} containing the store id.
   */
  storeValues(args: {
    values: NadaValues;
    ttl: Days;
    acl?: StoreAcl;
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
          acl: args.acl,
        }),
      ),
      E.bind("receipt", (args) => this.pay(args)),
      E.flatMap((args) => this.vm.storeValues(args)),
      effectToResultAsync,
    );
  }

  /**
   * Updates the store id location with the provided values.
   *
   * @param args - An object containing the store id to update with updated values and time-to-live.
   * @returns A promise resolving to the {@link Result} containing the {@link ActionId}.
   */
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

  /**
   * Fetches a store id's permissions.
   *
   * @param args - An object containing the {@link StoreId}.
   * @returns A promise resolving to the {@link Result} containing the {@link StoreAcl}.
   */
  fetchStoreAcl(args: {
    id: StoreId | string;
  }): Promise<Result<StoreAcl, UnknownException>> {
    return E.Do.pipe(
      E.bind("id", () =>
        E.try(() =>
          StoreId.parse(args.id, {
            path: ["client.fetchStoreAcl", "args.id"],
          }),
        ),
      ),
      E.let("operation", ({ id }) => Operation.fetchAcl({ id })),
      E.bind("receipt", ({ operation }) => this.pay({ operation })),
      E.flatMap(({ operation, receipt }) =>
        this.vm.fetchStoreAcl({ operation, receipt }),
      ),
      effectToResultAsync,
    );
  }

  /**
   * Sets the access control list for a stored value.
   *
   * The existing Acl is overwritten.
   *
   * @param args - An object containing the {@link StoreId} and the new {@link StoreAcl}.
   * @returns A promise resolving to the {@link Result} containing the {@link ActionId}.
   */
  setStoreAcl(args: {
    id: StoreId | string;
    acl: StoreAcl;
  }): Promise<Result<ActionId, UnknownException>> {
    return E.Do.pipe(
      E.bind("id", () =>
        E.try(() =>
          StoreId.parse(args.id, { path: ["setStoreAcl", "args.id"] }),
        ),
      ),
      E.let("operation", ({ id }) => Operation.setAcl({ id, acl: args.acl })),
      E.bind("receipt", (args) => this.pay(args)),
      E.flatMap((args) => this.vm.setStoreAcl(args)),
      effectToResultAsync,
    );
  }

  /**
   * Create a {@link NillionClient}.
   *
   * This factory initializes a `NillionClient` ready to accept network and user configs.
   *
   * @returns An unconfigured instance of `NillionClient`.
   * @see NillionClient.setNetworkConfig
   * @see NillionClient.setUserCredentials
   * @see NillionClient.connect
   */
  static create = () => {
    return new NillionClient();
  };
}
