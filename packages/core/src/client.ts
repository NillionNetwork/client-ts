import * as Wasm from "@nillion/client-wasm";
import { ClusterId, Multiaddr } from "./values";
import { Log } from "./logger";
import { PartyId, PriceQuote } from "@nillion/types";
import { z } from "zod";

export type NilVmClientArgs = {
  bootnodes: Multiaddr[];
  clusterId: ClusterId;
  // TODO(tim): support key + generate options
  userSeed: string;
  nodeSeed: string;
};

export class NilVmClient {
  constructor(
    public clusterId: ClusterId,
    public client: Wasm.NillionClient,
  ) {}

  public get partyId(): PartyId {
    return this.client.party_id;
  }

  async fetchQuote(operation: Wasm.Operation): Promise<PriceQuote> {
    Log("fetching quote for operation");
    const quote = await this.client.request_price_quote(
      this.clusterId,
      operation,
    );

    return PriceQuote.parse({
      expires: quote.expires_at,
      nonce: quote.nonce,
      cost: {
        base: quote.cost.base_fee,
        compute: quote.cost.compute_fee,
        congestion: quote.cost.congestion_fee,
        preprocessing: quote.cost.preprocessing_fee,
        total: quote.cost.total,
      },
    });
  }

  static create(args: NilVmClientArgs): NilVmClient {
    const userKey = Wasm.UserKey.from_seed(args.userSeed);
    const nodeKey = Wasm.NodeKey.from_seed(args.nodeSeed);
    const nilvm = new Wasm.NillionClient(userKey, nodeKey, args.bootnodes);

    return new NilVmClient(args.clusterId, nilvm);
  }
}
