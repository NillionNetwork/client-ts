import { execa, ExecaError } from "execa";

import path from "node:path";

import { parseArgs } from "./args";
import { Log, LOG_RUN_DIR, setupLoggingDir } from "./logging";
import { createProgramFixtures } from "./prepare-programs";
import { runDevnet } from "./run-devnet";
import { runTests } from "./run-tests";
import { loadEnv } from "./test-env";

export const TestEnv = {
  NILLION_TEST_TARGET: "",
  NILLION_TEST_DEVNET_PID: -1,
  NILLION_TEST_DEVNET_SEED: "test-fixture",
  NILLION_TEST_PROGRAMS_NAMESPACE: "",

  NILLION_BOOTNODE_MULTIADDRESS: "",
  NILLION_BOOTNODE_WEBSOCKET: "",
  NILLION_CLUSTER_ID: "",
  NILLION_NILCHAIN_CHAIN_ID: "",
  NILLION_NILCHAIN_JSON_RPC: "",

  NILLION_NILCHAIN_PRIVATE_KEY_0: "",
  NILLION_NILCHAIN_PRIVATE_KEY_1: "",
  NILLION_NILCHAIN_PRIVATE_KEY_2: "",
  NILLION_NILCHAIN_PRIVATE_KEY_3: "",
  NILLION_NILCHAIN_PRIVATE_KEY_4: "",
  NILLION_NILCHAIN_PRIVATE_KEY_5: "",
  NILLION_NILCHAIN_PRIVATE_KEY_6: "",
  NILLION_NILCHAIN_PRIVATE_KEY_7: "",
  NILLION_NILCHAIN_PRIVATE_KEY_8: "",
  NILLION_NILCHAIN_PRIVATE_KEY_9: "",

  NILLION_USER_SEED: "test-fixture",
};
export type TestEnv = typeof TestEnv;

const killDevnetIfSpawned = () => {
  if (TestEnv.NILLION_TEST_DEVNET_PID !== -1) {
    Log("Stopping nillion-devnet.");
    return execa`killall -s 9 nillion-devnet`;
  } else {
    Log("Leaving nillion-devnet running since fixture did not start it.");
  }
};

export const main = async (): Promise<void> => {
  try {
    const { target } = await parseArgs();
    const requiresPrograms = ["vms"];
    TestEnv.NILLION_TEST_TARGET = target;

    Log("Starting client-ts nillion-devnet fixture.");
    Log("Mode: %s", process.env.INTERACTIVE ? "interactive" : "ci");
    Log("Suite: %s", target);
    Log("Logs: %s", path.resolve(LOG_RUN_DIR));
    setupLoggingDir();

    await runDevnet();
    await loadEnv();

    if (requiresPrograms.includes(target)) {
      await createProgramFixtures();
    }

    Log("Test environment: %O", TestEnv);
    await runTests();

    Log("Tidying up.");
    await killDevnetIfSpawned();
    Log("Test complete.");
    process.exit();
  } catch (e) {
    await killDevnetIfSpawned();

    if (e instanceof ExecaError) {
      console.error(e.shortMessage);
    }
    console.error("Test fixture or suite failed. See log files.");
    process.exit(1);
  }
};

await main();
