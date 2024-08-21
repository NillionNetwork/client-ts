import { execa, ExecaError } from "execa";
import path from "node:path";
import { parseArgs } from "./args";
import { loadEnv } from "./test-env";
import { Log, LOG_RUN_DIR, setupLoggingDir } from "./logging";
import { createProgramFixtures } from "./prepare-programs";
import { runDevnet } from "./run-devnet";
import { runTests } from "./run-tests";

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

  NILLION_USER_SEED: "test-fixture",
};
export type TestEnv = typeof TestEnv;

const killDevnetIfSpawned = () => {
  if (TestEnv.NILLION_TEST_DEVNET_PID !== -1) {
    Log("Stopping devnet.");
    return execa`kill -s KILL ${TestEnv.NILLION_TEST_DEVNET_PID}`;
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

    const devnet = runDevnet();
    TestEnv.NILLION_TEST_DEVNET_PID = devnet.pid;

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
