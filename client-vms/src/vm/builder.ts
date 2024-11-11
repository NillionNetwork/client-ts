import { createClient } from "@connectrpc/connect";
import { createGrpcWebTransport } from "@connectrpc/connect-web";
import type { OfflineSigner } from "@cosmjs/proto-signing";
import {
  TokenAuthManager,
  createAuthInterceptor,
} from "@nillion/client-vms/auth";
import { Prime } from "@nillion/client-vms/gen-proto/nillion/membership/v1/cluster_pb";
import { Membership } from "@nillion/client-vms/gen-proto/nillion/membership/v1/service_pb";
import { Log } from "@nillion/client-vms/logger";
import { PaymentClientBuilder } from "@nillion/client-vms/payment/builder";
import { OfflineSignerSchema } from "@nillion/client-vms/types/grpc";
import { PartyId } from "@nillion/client-vms/types/types";
import { UserId } from "@nillion/client-vms/types/user-id";
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

export class VmClientBuilder {
  private _bootnodeUrl?: string;
  private _chainUrl?: string;
  private _signer?: OfflineSigner;
  private _seed?: string;
  private _network?: string;
  private _authTokenTtl?: number;

  bootnodeUrl(url: string): this {
    this._bootnodeUrl = url;
    return this;
  }

  chainUrl(url: string): this {
    this._chainUrl = url;
    return this;
  }

  signer(signer: OfflineSigner): this {
    this._signer = signer;
    return this;
  }

  network(name: "devnet"): this {
    this._network = name;
    return this;
  }

  seed(seed: string): this {
    this._seed = seed;
    return this;
  }

  authTokenTtl(ttl: number): this {
    this._authTokenTtl = ttl;
    return this;
  }

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

export const fetchClusterDetails = (bootnodeUrl: string) => {
  return createClient(
    Membership,
    createGrpcWebTransport({
      baseUrl: bootnodeUrl,
      useBinaryFormat: true,
    }),
  ).cluster({});
};
