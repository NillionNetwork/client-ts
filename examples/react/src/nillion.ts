import { createSignerFromKey } from "@nillion/client-payments";
import { NillionClient } from "@nillion/client-vms";

export const client = NillionClient.create({
  network: "TestFixture",
  userSeed: "thm",
  nodeSeed: "thm",

  overrides: async () => {
    const signer = await createSignerFromKey(
      "5c98e049ceca4e2c342516e1b81c689e779da9dbae64ea6b92d52684a92095e6",
    );
    return {
      signer,
      endpoint: "http://localhost:8080/nilchain",
    };
  },
});
