import { NamedNetwork } from "@nillion/client-core";
import { createSignerFromKey } from "@nillion/client-payments";
import { NillionClient } from "@nillion/client-vms";

export const client = NillionClient.create({
  network: NamedNetwork.enum.Devnet,

  overrides: async () => {
    // first account when running `nillion-devnet` with default seed
    const signer = await createSignerFromKey(
      "9a975f567428d054f2bf3092812e6c42f901ce07d9711bc77ee2cd81101f42c5",
    );
    return {
      endpoint: "http://localhost:8080/nilchain",
      signer,
      userSeed: "example@nillion",
    };
  },
});
