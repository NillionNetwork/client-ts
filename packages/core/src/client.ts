import { NillionConfig, configs } from "./configs";
import {
  NodeKey,
  Operation,
  PriceQuote,
  UserKey,
  NillionClient as WasmClient,
} from "@nillion/client-wasm";
import debug from "debug";
import initWasm from "@nillion/client-wasm";

let INIT_CALLED = false;

debug.enable("nillion:core");
const logger = debug("nillion:core");

type NetworkName = "devnet" | "testnet" | "petnet";

// don't rely on wasm types since that requires it to be initalised first
// and then we introduce the coloring problem
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

  public async fetchQuote(operation: Operation): Promise<PriceQuote> {
    // will always be an issue with this as we need to async init
    logger(`requesting quote: ${operation.toString()}`);
    return await this.wasm.request_price_quote(this.args.cluster, operation);
  }
}
