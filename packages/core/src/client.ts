import { NillionConfig, configs } from "./configs";
import initWasm, {
  NodeKey,
  Operation,
  PriceQuote,
  UserKey,
  NillionClient as WasmClient,
  NadaValues,
  PaymentReceipt,
  Permissions,
} from "@nillion/client-wasm";
import debug from "debug";

let INIT_CALLED = false;

debug.enable("nillion:core");
const logger = debug("nillion:core");

type NetworkName = "tests" | "devnet" | "testnet" | "petnet";

// don't rely on wasm types in the constructor because it requires wasm
// initialization which hasn't occurred at this stage
type NillionClientArgs = {
  bootnodes: string[];
  cluster: string;
  nodeSeed: string;
  userSeed: string;
};

function initialization_guard(): void | never {
  if (!INIT_CALLED) {
    throw new Error("client accessed before initialization");
  }
}

export class NillionClient {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private _wasm: WasmClient;

  private constructor(private args: NillionClientArgs) {}

  public static async init(): Promise<void> {
    if (INIT_CALLED) {
      logger("nillion init called more than once, ignoring subsequent calls");
      return;
    }

    INIT_CALLED = true;
    await initWasm();
    logger("wasm client initialized");
  }

  private get wasm(): WasmClient {
    initialization_guard();
    if (!this._wasm) {
      const userKey = UserKey.from_seed(this.args.userSeed);
      const nodeKey = NodeKey.from_seed(this.args.nodeSeed);
      this._wasm = new WasmClient(userKey, nodeKey, this.args.bootnodes);
    }
    return this._wasm;
  }

  // can't use anything from wasm at this point
  static fromConfig(config: NillionConfig): NillionClient {
    const args: NillionClientArgs = {
      bootnodes: config.vm.bootnodes,
      cluster: config.vm.clusterId,
      nodeSeed: config.user.userSeed,
      userSeed: config.user.nodeSeed,
    };
    return new NillionClient(args);
  }

  static forNetwork(network: NetworkName): NillionClient {
    const config = configs[network];
    return this.fromConfig(config);
  }

  public get partyId(): string {
    return this.wasm.party_id;
  }

  public get clusterId(): string {
    return this.args.cluster;
  }

  public async fetchQuote(operation: Operation): Promise<PriceQuote> {
    logger("requesting quote");
    return await this.wasm.request_price_quote(this.clusterId, operation);
  }

  public async storeValues(
    values: NadaValues,
    receipt: PaymentReceipt,
    permissions?: Permissions,
  ) {
    logger("storing values");
    return await this.wasm.store_values(
      this.clusterId,
      values,
      permissions,
      receipt,
    );
  }

  public async retrieveValue(
    storeId: string,
    name: string,
    receipt: PaymentReceipt,
  ) {
    logger(`retrieving value: id=${storeId} and name=${name}`);
    return await this.wasm.retrieve_value(
      this.clusterId,
      storeId,
      name,
      receipt,
    );
  }
}
