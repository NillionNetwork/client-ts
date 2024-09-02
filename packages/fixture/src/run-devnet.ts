import { execa } from "execa";

import fs, { writeFileSync } from "node:fs";
import * as readline from "node:readline";

import { getDevnetLogFile, Log } from "./logging";
import { TestEnv } from "./main";

const LOG_FILE = getDevnetLogFile();

export const runDevnet = async () => {
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
  TestEnv.NILLION_TEST_DEVNET_PID = result.pid + 1;

  const pattern = "nillion-devnet.env";
  Log("Waiting for nillion-devnet.env to be created.");
  await waitForLine(LOG_FILE, pattern);
  if (!fs.existsSync(LOG_FILE)) {
    throw new Error("Failed to detect nillion-devnet.env.");
  }
  Log("Detected nillion-devnet.env.");
};

const waitForLine = (file: string, pattern: string): Promise<void> => {
  return new Promise((resolve) => {
    const readStream = fs.createReadStream(file, { encoding: "utf8" });
    const rl = readline.createInterface({ input: readStream });

    const checkLine = (line: string) => {
      if (line.includes(pattern)) {
        rl.close();
        fs.unwatchFile(file, watcher);
        resolve();
      }
    };

    rl.on("line", checkLine);

    const watcher = () => {
      rl.close();
      const newRl = readline.createInterface({
        input: fs.createReadStream(file, { encoding: "utf8" }),
      });
      newRl.on("line", checkLine);
    };

    fs.watchFile(file, watcher);
  });
};
