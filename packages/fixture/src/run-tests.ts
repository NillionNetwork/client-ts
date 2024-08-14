import { execa } from "execa";
import { writeFileSync } from "node:fs";
import { getTestLogFile, Log } from "./logging";
import { TestEnv } from "./main";

export type TestSuiteName = keyof typeof Args;

const Args = {
  core: "test-client-core",
  payments: "test-client-payments",
  vms: "test-client-vms",
};

const ArgsInteractive = {
  core: "test-client-core-serve",
  payments: "test-client-payments-serve",
  vms: "test-client-vms-serve",
};

const LOG_FILE = getTestLogFile();

export const isValidTestSuiteName = (
  value: unknown,
): value is TestSuiteName => {
  return (
    Boolean(value) &&
    typeof value === "string" &&
    Object.keys(Args).includes(value)
  );
};

export const runTests = async (): Promise<void> => {
  const target = TestEnv.NILLION_TEST_TARGET as TestSuiteName;

  Log("Starting %s tests", target);
  const cmdArgs = process.env.INTERACTIVE
    ? ArgsInteractive[target]
    : Args[target];

  const result = execa({
    // @ts-expect-error not sure why the types aren't resolving for 'all'
    all: true,
    env: {
      PATH: process.env.PATH,
      PWD: process.env.PWD,
      ...TestEnv,
    },
    extendEnv: false,
  })`just ${cmdArgs}`;

  if (!result.pid) {
    console.error("Failed to start: just ", cmdArgs);
    process.exit(1);
  }

  // @ts-expect-error not sure why the types aren't resolving for 'all'
  result.all.on("data", (data: Uint8Array) => {
    writeFileSync(LOG_FILE, data, { flag: "a" });
  });

  await result;

  Log("✅ Test passed.");
};
