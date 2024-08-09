import { execa } from "execa";
import { writeFileSync } from "node:fs";
import { getDevnetLogFile, Log } from "./logging";
import { TestEnv } from "./main";

const LOG_FILE = getDevnetLogFile();

export const runDevnet = () => {
  Log("Starting nillion devnet.");

  const result = execa({
    all: true,
  })`nillion-devnet --seed ${TestEnv.NILLION_TEST_DEVNET_SEED}`;

  if (!result.pid) {
    console.error("Failed to start nillion-devnet");
    process.exit(1);
  }

  result.all.on("data", (data: Uint8Array) => {
    writeFileSync(LOG_FILE, data, { flag: "a" });
  });

  // It appears that nillion-devnet spawns a child process which is the
  // one that needs to be killed. So, cheap way to find that child's pid is pid + 1.
  const pid = result.pid + 1;

  return {
    result,
    pid,
  };
};
