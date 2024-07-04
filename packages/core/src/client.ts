import {
  NadaValues,
  NillionClient as WasmClient,
  Operation,
  PaymentReceipt,
  Permissions,
  PriceQuote,
} from "@nillion/client-wasm";
import { ClusterId, Multiaddr, StoreId } from "./values";
import { SigningStargateClient } from "@cosmjs/stargate";
import { OfflineSigner } from "@cosmjs/proto-signing";
import { Log } from "./logger";
import { MsgPayFor, typeUrl } from "./proto";
import { Token } from "./token";

type NillionClientArgs = {
  bootnodes: Multiaddr[];
  cluster: ClusterId;
  clients: {
    vm: WasmClient;
    chain: SigningStargateClient;
  };
  chainSigner: OfflineSigner;
};

export class NillionClient {
  constructor(private args: NillionClientArgs) {}

  public get clients(): { vm: WasmClient; chain: SigningStargateClient } {
    return this.args.clients;
  }

  public get partyId(): string {
    return this.clients.vm.party_id;
  }

  public get clusterId(): string {
    return this.args.cluster;
  }

  async fetchQuote(operation: Operation): Promise<PriceQuote> {
    Log("fetching quote for operation");
    return await this.clients.vm.request_price_quote(this.clusterId, operation);
  }

  async storeValues(
    values: NadaValues,
    ttlDays: number,
    permissions?: Permissions,
  ): Promise<StoreId> {
    Log("store values: executing");
    const operation = Operation.store_values(values, ttlDays);
    const quote = await this.fetchQuote(operation);
    const receipt = await this.pay(quote);
    const result = await this.clients.vm.store_values(
      this.clusterId,
      values,
      permissions,
      receipt,
    );

    return StoreId.parse(result);
  }

  private async pay(quote: PriceQuote): Promise<PaymentReceipt> {
    const accounts = await this.args.chainSigner.getAccounts();
    const from = accounts[0].address;

    const payload: MsgPayFor = {
      fromAddress: from,
      resource: quote.nonce,
      amount: [{ denom: Token.Unil, amount: quote.cost.total }],
    };

    const result = await this.clients.chain.signAndBroadcast(
      from,
      [{ typeUrl, value: payload }],
      "auto",
    );

    return new PaymentReceipt(quote, result.transactionHash);
  }
}
