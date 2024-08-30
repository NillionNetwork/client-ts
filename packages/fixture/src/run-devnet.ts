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

  // The command nillion-devnet is proxied through nilup, meaning, we cannot rely on the pid returned by execa.
  // When terminating nillion-devnet we use killall to work around this, however it's useful to track the pid.
  const pid = result.pid + 1;

  return {
    result,
    pid,
  };
};
