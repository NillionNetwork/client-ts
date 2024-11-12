import { createClient } from "@connectrpc/connect";
import { createGrpcWebTransport } from "@connectrpc/connect-web";
import type { OfflineSigner } from "@cosmjs/proto-signing";
import {
  TokenAuthManager,
  createAuthInterceptor,
} from "@nillion/client-vms/auth";
import {
  type Cluster,
  Prime,
} from "@nillion/client-vms/gen-proto/nillion/membership/v1/cluster_pb";
import { Membership } from "@nillion/client-vms/gen-proto/nillion/membership/v1/service_pb";
import { Log } from "@nillion/client-vms/logger";
import { PaymentClientBuilder } from "@nillion/client-vms/payment";
import { PartyId, UserId } from "@nillion/client-vms/types";
import { OfflineSignerSchema } from "@nillion/client-vms/types/grpc";
import { assertIsDefined } from "@nillion/client-vms/util";
import { VmClient, VmClientConfig } from "@nillion/client-vms/vm/client";
import { SecretMasker } from "@nillion/client-wasm";
import { z } from "zod";

export const VmClientBuilderConfig = z.object({
  bootnodeUrl: z.string().url("Invalid bootnode url"),
  chainUrl: z.string().url("Invalid chain url"),
  signer: OfflineSignerSchema,
  seed: z.string().min(1),
  authTokenTtl: z.number(),
});

export type VmClientBuilderConfig = z.infer<typeof VmClientBuilderConfig>;

/**
 * Builder for creating a configured instance of {VmClient}.
 *
 * This builder allows setting various configuration options required to
 * initialize a client for interacting with the Nillion network.
 *
 * Example usage:
 *
 * @example
 * ```ts
 * const signer = await createSignerFromKey(Env.WalletPrivateKey);
 *
 * const client = await new VmClientBuilder()
 *   .authTokenTtl(1)
 *   .seed(Env.userSeed)
 *   .bootnodeUrl(Env.bootnodeUrl)
 *   .chainUrl(Env.nilChainUrl)
 *   .signer(signer)
 *   .build();
 * ```
 */
export class VmClientBuilder {
  private _bootnodeUrl?: string;
  private _chainUrl?: string;
  private _signer?: OfflineSigner;
  private _seed?: string;
  private _authTokenTtl?: number;

  /**
   * Set the Nillion network bootnode Url. This can be any node in the network.
   *
   * @param {string} url - The Url of the bootnode.
   * @returns {this} The current builder instance.
   */
  bootnodeUrl(url: string): this {
    this._bootnodeUrl = url;
    return this;
  }

  /**
   * Set the NiLChain RPC Url.
   *
   * @param {string} url - The URL of the chain.
   * @returns {this} The current builder instance.
   */
  chainUrl(url: string): this {
    this._chainUrl = url;
    return this;
  }

  /**
   * Set the {OfflineSigner} used for signing transactions.
   *
   * @param {OfflineSigner} signer - The offline signer instance.
   * @returns {this} The current builder instance.
   */
  signer(signer: OfflineSigner): this {
    this._signer = signer;
    return this;
  }

  /**
   * Set the user secret seed for generating gRPC authentication tokens.
   *
   * @param {string} seed - The seed string.
   * @returns {this} The current builder instance.
   */
  seed(seed: string): this {
    this._seed = seed;
    return this;
  }

  /**
   * Sets the time-to-live for gRPC authentication tokens.
   *
   * @param {number} ttl - The token TTL in seconds.
   * @returns {this} The current builder instance.
   */
  authTokenTtl(ttl: number): this {
    this._authTokenTtl = ttl;
    return this;
  }

  /**
   * Builds and returns a configured {VmClient} instance.
   *
   * This method initializes the client with the specified configuration
   * options, connects to a bootnode to retrieve Nillion network configuration,
   * and instantiates a VmClient.
   *
   * @returns {Promise<VmClient>} A promise that resolves to a configured `VmClient` instance.
   * @throws {Error} If builder configuration is incomplete or invalid.
   */
  async build(): Promise<VmClient> {
    const { bootnodeUrl, chainUrl, signer, seed } = VmClientBuilderConfig.parse(
      {
        bootnodeUrl: this._bootnodeUrl,
        chainUrl: this._chainUrl,
        signer: this._signer,
        seed: this._seed,
        authTokenTtl: this._authTokenTtl,
      },
    );

    const tokenAuthManager = TokenAuthManager.fromSeed(seed);
    const cluster = await fetchClusterDetails(bootnodeUrl);

    const leaderClusterInfo = cluster.leader;
    if (
      !leaderClusterInfo ||
      !leaderClusterInfo.identity ||
      !leaderClusterInfo.grpcEndpoint
    )
      throw new Error("Leader id not in cluster details");

    const id = PartyId.from(leaderClusterInfo.identity.contents);
    const leader = {
      id,
      transport: createGrpcWebTransport({
        baseUrl: leaderClusterInfo.grpcEndpoint,
        useBinaryFormat: true,
        interceptors: [createAuthInterceptor(tokenAuthManager, id)],
      }),
    };

    const nodes = cluster.members.map((node) => {
      assertIsDefined(node.identity?.contents, "node.identity.contents");
      const id = PartyId.from(node.identity?.contents);
      return {
        id,
        transport: createGrpcWebTransport({
          baseUrl: node.grpcEndpoint,
          useBinaryFormat: true,
          interceptors: [createAuthInterceptor(tokenAuthManager, id)],
        }),
      };
    });

    let masker: SecretMasker;
    const polynomialDegree = BigInt(cluster.polynomialDegree);
    const partyIds = nodes.map((node) => node.id.toWasm());
    switch (cluster.prime) {
      case Prime.SAFE_64_BITS: {
        masker = SecretMasker.new_64_bit_safe_prime(polynomialDegree, partyIds);
        break;
      }
      case Prime.SAFE_128_BITS: {
        masker = SecretMasker.new_128_bit_safe_prime(
          polynomialDegree,
          partyIds,
        );
        break;
      }
      case Prime.SAFE_256_BITS: {
        masker = SecretMasker.new_256_bit_safe_prime(
          polynomialDegree,
          partyIds,
        );
        break;
      }
      default: {
        throw new Error(`Unsupported cluster prime: ${cluster.prime}`);
      }
    }

    const payer = await new PaymentClientBuilder()
      .chainUrl(chainUrl)
      .signer(signer)
      .leader(leader.transport)
      .build();

    const config = VmClientConfig.parse({
      id: UserId.from(tokenAuthManager.publicKey),
      payer,
      masker,
      leader,
      nodes,
    });

    Log.info("Client connected");

    return new VmClient(config);
  }
}

/**
 * Fetches cluster details from the specified bootnode Url.
 *
 * @param {string} bootnodeUrl - The Url of the bootnode to query.
 * @returns {Promise<Cluster>} A promise that resolves with the cluster details.
 */
export const fetchClusterDetails = (bootnodeUrl: string): Promise<Cluster> => {
  return createClient(
    Membership,
    createGrpcWebTransport({
      baseUrl: bootnodeUrl,
      useBinaryFormat: true,
    }),
  ).cluster({});
};
