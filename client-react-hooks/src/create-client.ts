import { VmClientBuilder, createSignerFromKey } from "@nillion/client-vms";
import type { VmClientBuilderConfig } from "@nillion/client-vms";

export type Network = "testnet" | "devnet" | "custom";

export async function createClient(
  network: Network,
  _overrides?: Partial<VmClientBuilderConfig>,
) {
  switch (network) {
    default: {
      const singer = await createSignerFromKey(
        "9a975f567428d054f2bf3092812e6c42f901ce07d9711bc77ee2cd81101f42c5",
      );
      return await new VmClientBuilder()
        .seed("tests")
        .bootnodeUrl("http://127.0.0.1:43207")
        .chainUrl("http://127.0.0.1:48102")
        .signer(singer)
        .build();
    }
  }
}
