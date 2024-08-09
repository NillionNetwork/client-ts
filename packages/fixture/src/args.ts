import yargs from "yargs";
import { isValidTestSuiteName, TestSuiteName } from "./run-tests";

export const parseArgs = async (): Promise<{ target: TestSuiteName }> => {
  // args passed after -- are intended for this script
  // so we can ignore everything before it
  const argvString = process.argv.slice(3).join(" ");
  const args = await yargs(argvString).argv;
  const name = args.test;

  if (!isValidTestSuiteName(name)) {
    const message =
      "--tests must be one of client-core, client-payments, client-vms but got " +
      String(name);
    console.error(message);
    throw new Error(message);
  }

  return { target: name };
};
