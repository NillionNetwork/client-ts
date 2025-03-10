import type { Interceptor, Transport } from "@connectrpc/connect";
import { SecretMasker } from "@nillion/client-wasm";
import { z } from "zod";
import { PaymentClient } from "#/payment";
import { GrpcTransport, PartyId, UserId } from "#/types";
import {
  DeleteValuesBuilder,
  InvokeComputeBuilder,
  OverwritePermissionsBuilder,
  QueryPoolStatusBuilder,
  RetrieveComputeResultBuilder,
  RetrievePermissionsBuilder,
  RetrieveValuesBuilder,
  StoreProgramBuilder,
  StoreValuesBuilder,
  UpdatePermissionsBuilder,
} from "./operation";

/**
 * Configuration for communicating with a Nillion network node.
 *
 * @property {PartyId} id - The node's public key
 * @property {GrpcTransport} transport - A gRPC transport client
 */
export const NodeConfig = z.object({
  id: z.instanceof(PartyId),
  transport: GrpcTransport,
});
export type NodeConfig = z.infer<typeof NodeConfig>;

/**
 * The configuration for a Nillion network VM Client.
 *
 * @property {UserId} id - The client's public key
 * @property {PaymentClient} payer - Client for handling operation payments
 * @property {SecretMasker} masker - Utility for working with secret shares
 * @property {NodeConfig} leader - Details for the leader node
 * @property {NodeConfig[]} nodes - Details for participating nodes
 */
export const VmClientConfig = z.object({
  id: z.instanceof(UserId),
  payer: z.instanceof(PaymentClient),
  masker: z.custom<SecretMasker>((arg) => arg instanceof SecretMasker),
  leader: NodeConfig,
  nodes: z.array(NodeConfig),
});
export type VmClientConfig = z.infer<typeof VmClientConfig>;

/**
 * Client for interacting with nilVM operations and secure computations in the Nillion network.
 *
 * This class provides functionality for managing secret values, handling access permissions,
 * storing and executing secure computation programs, and querying the preprocessing pool status.
 *
 * Usage involves configuring the client with the appropriate network and payment settings,
 * then utilizing various builders to perform operations.
 */
export class VmClient {
  /**
   * Creates a  VmClient instance.
   *
   * @param {VmClientConfig} config - Configuration settings for the client
   */
  constructor(readonly config: VmClientConfig) {}

  /**
   * A user identifier derived from a public key.
   *
   * @returns {UserId} This client's unique identifier
   * @see PublicKey
   */
  get id(): UserId {
    return this.config.id;
  }

  /**
   * The leader node's configuration.
   *
   * @returns {NodeConfig} Configuration object for the leader node
   */
  get leader(): NodeConfig {
    return this.config.leader;
  }

  /**
   * Configuration for all non-leader nodes.
   *
   * @returns {NodeConfig[]} Array of node configuration objects
   */
  get nodes(): NodeConfig[] {
    return this.config.nodes;
  }

  /**
   * The NilChain payment client using the provided {OfflineSigner}.
   * This client is automatically invoked as part of an {Operation}'s invocation.
   *
   * @returns {PaymentClient} Payment client for managing operation costs
   * @see Operation.invoke
   */
  get payer(): PaymentClient {
    return this.config.payer;
  }

  /**
   * Wasm class for masking and unmasking secret share values.
   *
   * @returns {SecretMasker} Secret masking utility instance
   */
  get masker(): SecretMasker {
    return this.config.masker;
  }

  /**
   * Creates a builder for querying the preprocessing pool status of the cluster.
   *
   * @returns {QueryPoolStatusBuilder} Builder for constructing pool status queries
   * @see QueryPoolStatusBuilder
   * @example
   * ```ts
   * const status = await client
   *  .queryPoolStatus()
   *  .build()
   *  .invoke();
   * ```
   */
  queryPoolStatus(): QueryPoolStatusBuilder {
    return QueryPoolStatusBuilder.init(this);
  }

  /**
   * Creates a builder for storing secret values in the cluster.
   *
   * @returns {StoreValuesBuilder} Builder for constructing store values operations
   * @see StoreValuesBuilder
   * @example
   * Store values:
   * ```ts
   * const id = await client
   *   .storeValues()
   *   .ttl(1)
   *   .value("foo", NadaValue.new_secret_integer("42"))
   *   .value("bar", NadaValue.new_public_integer("23"))
   *   .value("baz", NadaValue.new_secret_blob(Uint8Array.from([1, 2, 3])))
   *   .build()
   *   .invoke();
   *
   * console.log(id) // "312fda16-3bfa-4160-89cf-389e224c91b6"
   * ```
   *
   * @example
   * If names overlap then update otherwise replace values at the given id:
   * ```ts
   * const id = await client
   *   .storeValues()
   *   .ttl(1)
   *   .id(id) // the exist values id to update
   *   .value("bob", NadaValue.new_secret_integer("77"))
   *   .build()
   *   .invoke();
   *
   * console.log(id) // "312fda16-3bfa-4160-89cf-389e224c91b6"
   * ```
   */
  storeValues(): StoreValuesBuilder {
    return StoreValuesBuilder.init(this);
  }

  /**
   * Creates a builder for retrieving secret values from the cluster.
   *
   * @returns {RetrieveValuesBuilder} Builder for constructing retrieve operations
   * @see RetrieveValuesBuilder
   * @example
   * ```ts
   * const data = await client
   *   .retrieveValues()
   *   .id(id)
   *   .build()
   *   .invoke();
   *
   * console.log(id) // [{"name":"bob","value":{"type":"SecretInteger","value":"77"}}]
   * ```
   */
  retrieveValues(): RetrieveValuesBuilder {
    return RetrieveValuesBuilder.init(this);
  }

  /**
   * Creates a builder for deleting secret values from the cluster.
   *
   * @returns {DeleteValuesBuilder} Builder for constructing delete operations
   * @see DeleteValuesBuilder
   * @example
   * ```ts
   * await client
   *   .deleteValues()
   *   .id(id)
   *   .build()
   *   .invoke();
   * ```
   */
  deleteValues(): DeleteValuesBuilder {
    return DeleteValuesBuilder.init(this);
  }

  /**
   * Creates a builder for retrieving permissions associated with values.
   *
   * @returns {RetrievePermissionsBuilder} Builder for constructing permission retrieval operations
   * @see RetrievePermissionsBuilder
   * @example
   * ```ts
   * const permissions = await client
   *   .retrievePermissions()
   *   .id(id)
   *   .build()
   *   .invoke();
   *
   * console.log(permissions) // {"owner":"163aff316bd4247d86f73d088a620f8d77ff88b5","retrieve":["163aff316bd4247d86f73d088a620f8d77ff88b5"],"update":["163aff316bd4247d86f73d088a620f8d77ff88b5"],"delete":["163aff316bd4247d86f73d088a620f8d77ff88b5"],"compute":[]}
   * ```
   */
  retrievePermissions(): RetrievePermissionsBuilder {
    return RetrievePermissionsBuilder.init(this);
  }

  /**
   * Creates a builder for updating existing permissions on values.
   *
   * @returns {UpdatePermissionsBuilder} Builder for constructing permission update operations
   * @see UpdatePermissionsBuilder
   * @example
   * ```ts
   * await client
   *   .updatePermissions()
   *   .valuesId(id)
   *   .revokeDelete(client.id)
   *   .build()
   *   .invoke();
   *
   * const updatedPermissions = await client
   *   .retrievePermissions()
   *   .id(id)
   *   .build()
   *   .invoke();
   *
   * console.log(permissions) // {"owner":"163aff316bd4247d86f73d088a620f8d77ff88b5","retrieve":["163aff316bd4247d86f73d088a620f8d77ff88b5"],"update":["163aff316bd4247d86f73d088a620f8d77ff88b5"],"delete":[],"compute":[]}
   * ```
   */
  updatePermissions(): UpdatePermissionsBuilder {
    return UpdatePermissionsBuilder.init(this);
  }

  /**
   * Creates a builder for completely overwriting permissions on values.
   *
   * @returns {OverwritePermissionsBuilder} Builder for constructing permission overwrite operations
   * @see OverwritePermissionsBuilder
   * @example
   * ```ts
   * const permissions = ValuesPermissionsBuilder.default(client.id);
   *
   * const permissions = await client
   *   .overwritePermissions()
   *   .permissions(next)
   *   .id(id)
   *   .build()
   *   .invoke();
   *
   * console.log(permissions) // {"owner":"163aff316bd4247d86f73d088a620f8d77ff88b5","retrieve":["163aff316bd4247d86f73d088a620f8d77ff88b5"],"update":["163aff316bd4247d86f73d088a620f8d77ff88b5"],"delete":[],"compute":[]}
   * ```
   */
  overwritePermissions(): OverwritePermissionsBuilder {
    return OverwritePermissionsBuilder.init(this);
  }

  /**
   * Creates a builder for storing Nada programs in the cluster.
   *
   * @returns {StoreProgramBuilder} Builder for constructing program storage operations
   * @see StoreProgramBuilder
   * @example
   * ```ts
   * const program: Uint8Array = loadProgram("simple_shares.nada.bin");
   *
   * const programId = await client
   *   .storeProgram()
   *   .name(name)
   *   .program(program)
   *   .build()
   *   .invoke();
   *
   * console.log(programId) // 163aff316bd4247d86f73d088a620f8d77ff88b5/addition_division.nada.bin/sha256/5c9a45727ae02ed8aea7269460ae66d462604c910bba87afb90b8a6c2c5119d9
   * ```
   */
  storeProgram(): StoreProgramBuilder {
    return StoreProgramBuilder.init(this);
  }

  /**
   * Creates a builder for invoking secure computation programs.
   *
   * @returns {InvokeComputeBuilder} Builder for constructing compute invocation operations
   * @see InvokeComputeBuilder
   * @example
   * ```ts
   * const computeResultId = await client
   *   .invokeCompute()
   *   .program(programId)
   *   .inputParty("Party1", client.id)
   *   .outputParty("Party1", [client.id])
   *   .computeTimeValues("A", NadaValue.new_secret_integer("1"))
   *   .computeTimeValues("B", NadaValue.new_secret_integer("4"))
   *   .build()
   *   .invoke();
   *
   * console.log(computeResultId) // 5d2fb309-23b3-4a16-8070-c8b802707768
   * ```
   */
  invokeCompute(): InvokeComputeBuilder {
    return InvokeComputeBuilder.init(this);
  }

  /**
   * Creates a builder for retrieving results of secure computations.
   *
   * @returns {RetrieveComputeResultBuilder} Builder for constructing compute result retrieval operations
   * @see RetrieveComputeResultBuilder
   * @example
   * ```ts
   * const result = await client
   *   .retrieveComputeResult()
   *   .id(computeResultId)
   *   .build()
   *   .invoke();
   *
   *  console.log(result) // {"my_output":{"type":"SecretInteger","value":"12"}}
   * ```
   */
  retrieveComputeResult(): RetrieveComputeResultBuilder {
    return RetrieveComputeResultBuilder.init(this);
  }
}

export async function createGrpcTransport(
  bootnodeUrl: string,
  interceptors: Interceptor[],
): Promise<Transport> {
  if (typeof process !== "undefined" && process.versions?.node) {
    return import("@connectrpc/connect-node").then((module) => {
      return module.createGrpcWebTransport({
        baseUrl: bootnodeUrl,
        httpVersion: "1.1",
        interceptors: interceptors,
      });
    });
  }
  return import("@connectrpc/connect-web").then((module) => {
    return module.createGrpcWebTransport({
      baseUrl: bootnodeUrl,
      useBinaryFormat: true,
      interceptors: interceptors,
    });
  });
}
