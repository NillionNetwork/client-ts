import fs from "node:fs";

import { parse } from "dotenv";

import { Log } from "./logging";
import { TestEnv } from "./main";

const waitForFileSync = async (path: string): Promise<string> => {
  let iteration = 0;
  const timeout = 500;
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (iteration > 20) {
        clearInterval(interval);
        reject(
          new Error(
            `${path} was not detected in ${String(timeout * iteration)}ms`,
          ),
        );
        return;
      }

      if (fs.existsSync(path)) {
        clearInterval(interval);
        const file = fs.readFileSync(path, "utf8");
        resolve(file);
        return;
      }

      iteration += 1;
    }, timeout);
  });
};

export const loadEnv = async (): Promise<void> => {
  Log("Watching for nillion-devnet environment file.");
  const home = process.env.HOME;
  if (!home) throw new Error("Env var HOME unset");

  const path = `${home}/.config//nillion/nillion-devnet.env`;
  const file = await waitForFileSync(path);
  const fromEnvFile = parse(file);

  TestEnv.NILLION_BOOTNODE_MULTIADDRESS =
    fromEnvFile.NILLION_BOOTNODE_MULTIADDRESS;
  TestEnv.NILLION_BOOTNODE_WEBSOCKET = fromEnvFile.NILLION_BOOTNODE_WEBSOCKET;
  TestEnv.NILLION_CLUSTER_ID = fromEnvFile.NILLION_CLUSTER_ID;
  TestEnv.NILLION_NILCHAIN_CHAIN_ID = fromEnvFile.NILLION_NILCHAIN_CHAIN_ID;
  TestEnv.NILLION_NILCHAIN_JSON_RPC = fromEnvFile.NILLION_NILCHAIN_JSON_RPC;
  TestEnv.NILLION_NILCHAIN_PRIVATE_KEY_0 =
    fromEnvFile.NILLION_NILCHAIN_PRIVATE_KEY_0;
};
