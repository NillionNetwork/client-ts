import { parse } from "dotenv";
import fs from "node:fs";
import { createInterface } from "node:readline";
import { getDevnetLogFile, Log } from "./logging";
import { TestEnv } from "./main";

export const watchFileForLine = (target: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const filePath = getDevnetLogFile();

    if (!fs.existsSync(filePath)) {
      console.log(`${filePath} does not exist`);
      reject(new Error(`${filePath} does not exist`));
    }

    let fileProcessedSize = 0;
    let done = false;

    const watcher = fs.watch(filePath, (eventType) => {
      if (done) {
        watcher.close();
      } else if (eventType === "change") {
        const stream = fs.createReadStream(filePath, {
          start: fileProcessedSize,
        });
        const rl = createInterface({ input: stream });

        rl.on("line", (line) => {
          if (line.includes(target)) {
            done = true;
            resolve(line);
          } else {
            fileProcessedSize += Buffer.byteLength(line + "\n");
          }
        });
      }
    });
  });

export const loadEnv = async (): Promise<void> => {
  Log("Watching for nillion-devnet environment file.");
  const marker = "nillion-devnet.env";
  const line = await watchFileForLine(marker);
  const path = line.substring(line.indexOf("/")).trim();
  const fromEnvFile = parse(fs.readFileSync(path, "utf8"));

  TestEnv.NILLION_BOOTNODE_WEBSOCKET = fromEnvFile.NILLION_BOOTNODE_WEBSOCKET;
  TestEnv.NILLION_CLUSTER_ID = fromEnvFile.NILLION_CLUSTER_ID;
  TestEnv.NILLION_NILCHAIN_CHAIN_ID = fromEnvFile.NILLION_NILCHAIN_CHAIN_ID;
  TestEnv.NILLION_NILCHAIN_JSON_RPC = fromEnvFile.NILLION_NILCHAIN_JSON_RPC;
  TestEnv.NILLION_NILCHAIN_PRIVATE_KEY_0 =
    fromEnvFile.NILLION_NILCHAIN_PRIVATE_KEY_0;
};
