import { execa } from "execa";
import { randomUUID } from "node:crypto";
import path from "node:path";
import fs, { writeFileSync } from "node:fs";
import { getPrepareProgramsLogFile, Log } from "./logging";
import { TestEnv } from "./main";

const LOG_FILE = getPrepareProgramsLogFile();

export const createProgramFixtures = async (): Promise<string[]> => {
  Log("Compiling and uploading programs to devnet.");
  const baseDir = path.resolve(process.cwd(), "../resources/programs");
  const srcDir = path.resolve(baseDir, "src");
  const distDir = path.resolve(baseDir, "dist");

  const programs = [];
  const binaries = await preparePrograms(baseDir, srcDir);
  // cannot map due to quote timeout with node_seed
  for (const bin of binaries) {
    const programId = await storeProgram(distDir, bin);
    programs.push(programId);
    Log("Program namespace: %s", programId);
  }

  const programsNamespace = programs[0].split("/")[0];
  TestEnv.NILLION_TEST_PROGRAMS_NAMESPACE = programsNamespace;

  return programs;
};

const storeProgram = async (distDir: string, binaryName: string) => {
  const result = execa({
    all: true,
    env: { PATH: process.env.PATH },
    extendEnv: false,
  })`nillion
    -b ${TestEnv.NILLION_BOOTNODE_WEBSOCKET}
    --node-key-seed ${randomUUID().toString()},
    --user-key-seed ${TestEnv.NILLION_USER_SEED}
    --nilchain-rpc-endpoint ${TestEnv.NILLION_NILCHAIN_JSON_RPC}
    --nilchain-private-key ${TestEnv.NILLION_NILCHAIN_PRIVATE_KEY_0}
    store-program
    --cluster-id ${TestEnv.NILLION_CLUSTER_ID}
    ${distDir}/${binaryName}
    ${binaryName}`;

  result.all.on("data", (data: Uint8Array) => {
    writeFileSync(LOG_FILE, data, { flag: "a" });
  });
  const { stdout } = await result;

  /*
   * Until there is a json output we need to manually parse. Expected format:
   * Payments transaction hash: ... \n
   * Program ID: ... \n
   */
  const output = stdout.split("Program ID:");
  return output[1].trim();
};

export const preparePrograms = async (
  baseDir: string,
  srcDir: string,
): Promise<string[]> => {
  const result = execa({ all: true, cwd: baseDir })`./setup_venv.sh`;

  result.all.on("data", (data: Uint8Array) => {
    writeFileSync(LOG_FILE, data, { flag: "a" });
  });
  await result;

  Log("Python venv initialized");

  const promises = fs
    .readdirSync(srcDir)
    .filter((file) => file.endsWith(".py"))
    .map((file) => compileProgram(baseDir, file));

  return await Promise.all(promises);
};

const compileProgram = async (
  baseDir: string,
  file: string,
): Promise<string> => {
  const result = execa({
    all: true,
    cwd: baseDir,
  })`./build_program.sh src/${file}`;

  result.all.on("data", (data: Uint8Array) => {
    writeFileSync(LOG_FILE, data, { flag: "a" });
  });

  await result;

  const binaryName = file.replace(".py", ".nada.bin");
  Log("Compiled src/%s to dist/%s", file, binaryName);
  return binaryName;
};
