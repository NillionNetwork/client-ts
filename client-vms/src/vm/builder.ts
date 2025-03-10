import { type Client, createClient } from "@connectrpc/connect";
import type { OfflineSigner } from "@cosmjs/proto-signing";
import { SecretMasker } from "@nillion/client-wasm";
import { Effect as E, pipe } from "effect";
import { z } from "zod";
import { TokenAuthManager, createAuthInterceptor } from "#/auth";
import {
  type Cluster,
  Prime,
} from "#/gen-proto/nillion/membership/v1/cluster_pb";
import { Membership } from "#/gen-proto/nillion/membership/v1/service_pb";
import type { NodeVersion } from "#/gen-proto/nillion/membership/v1/version_pb";
import { Log } from "#/logger";
import { PaymentClientBuilder, PaymentMode } from "#/payment";
import { PartyId, UserId } from "#/types";
import { OfflineSignerSchema } from "#/types/grpc";
import { assertIsDefined, unwrapExceptionCause } from "#/util";
import { VmClient, VmClientConfig, createGrpcTransport } from "#/vm/client";

export const VmClientBuilderConfig = z.object({
  bootnodeUrl: z.string().url("Invalid bootnode url"),
  chainUrl: z.string().url("Invalid chain url"),
  signer: OfflineSignerSchema,
  seed: z.string().min(1),
  paymentMode: z.nativeEnum(PaymentMode),
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
  private _paymentMode?: PaymentMode;

  constructor(paymentMode: PaymentMode = PaymentMode.FromBalance) {
    this._paymentMode = paymentMode;
  }

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
    const { bootnodeUrl, chainUrl, signer, seed, paymentMode } =
      VmClientBuilderConfig.parse({
        bootnodeUrl: this._bootnodeUrl,
        chainUrl: this._chainUrl,
        signer: this._signer,
        seed: this._seed,
        paymentMode: this._paymentMode,
      });

    const tokenAuthManager = TokenAuthManager.fromSeed(seed);
    const cluster = await fetchClusterDetails(bootnodeUrl);

    let supportedPaymentMode = paymentMode;
    if (paymentMode === PaymentMode.FromBalance) {
      const version = await fetchNodeVersion(bootnodeUrl);
      const semver = version.version;
      const supportBalances =
        semver === undefined || semver.major > 0 || semver.minor >= 8;
      if (!supportBalances) {
        Log(
          "Falling back to paying per operation as network does not support this",
        );
        supportedPaymentMode = PaymentMode.PayPerOperation;
      }
    }

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
      transport: await createGrpcTransport(leaderClusterInfo.grpcEndpoint, [
        createAuthInterceptor(tokenAuthManager, id),
      ]),
    };

    const nodes = await Promise.all(
      cluster.members.map(async (node) => {
        assertIsDefined(node.identity?.contents, "node.identity.contents");
        const id = PartyId.from(node.identity?.contents);
        return {
          id,
          transport: await createGrpcTransport(node.grpcEndpoint, [
            createAuthInterceptor(tokenAuthManager, id),
          ]),
        };
      }),
    );

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

    const user_id = UserId.from(tokenAuthManager.publicKey);
    const payer = await new PaymentClientBuilder()
      .chainUrl(chainUrl)
      .paymentMode(supportedPaymentMode)
      .id(user_id)
      .signer(signer)
      .leader(leader.transport)
      .build();

    const config = VmClientConfig.parse({
      id: user_id,
      payer,
      masker,
      leader,
      nodes,
    });

    Log("Client connected");

    return new VmClient(config);
  }
}

async function createMembershipClient(
  bootnodeUrl: string,
): Promise<Client<typeof Membership>> {
  return pipe(
    E.tryPromise(() => createGrpcTransport(bootnodeUrl, [])),
    E.andThen((transport) => createClient(Membership, transport)),
    E.runPromise,
  );
}

/**
 * Fetches cluster details from the specified bootnode Url.
 *
 * @param {string} bootnodeUrl - The Url of the bootnode to query.
 * @returns {Promise<Cluster>} A promise that resolves with the cluster details.
 */
export const fetchClusterDetails = (bootnodeUrl: string): Promise<Cluster> => {
  return pipe(
    E.tryPromise(() => createMembershipClient(bootnodeUrl)),
    E.andThen((client) => client.cluster({})),
    E.catchAll(unwrapExceptionCause),
    E.tapBoth({
      onFailure: (e) => E.sync(() => Log("Values delete failed: %O", e)),
      onSuccess: (id) => E.sync(() => Log(`Values deleted: ${id}`)),
    }),
    E.runPromise,
  );
};

/**
 * Fetches node version details from the specified bootnode Url.
 *
 * @param {string} bootnodeUrl - The Url of the bootnode to query.
 * @returns {Promise<Cluster>} A promise that resolves with the node version.
 */
export const fetchNodeVersion = (bootnodeUrl: string): Promise<NodeVersion> => {
  return pipe(
    E.tryPromise(() => createMembershipClient(bootnodeUrl)),
    E.andThen((client) => client.nodeVersion({})),
    E.catchAll(unwrapExceptionCause),
    E.runPromise,
  );
};
