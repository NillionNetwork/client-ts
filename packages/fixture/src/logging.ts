import debug from "debug";

import fs from "node:fs";
import path from "node:path";

debug.enable("nillion:*");
export const Log = debug("nillion:fixture");
Log.log = console.log.bind(console);

export const LOG_RUN_DIR = path.resolve("./logs");

export const setupLoggingDir = () => {
  fs.mkdirSync(LOG_RUN_DIR, { recursive: true });

  const runTimestamp = new Date().toISOString();
  fs.writeFileSync(`${LOG_RUN_DIR}/timestamp.log`, runTimestamp);

  fs.writeFileSync(getDevnetLogFile(), "");
  fs.writeFileSync(getTestLogFile(), "");
  fs.writeFileSync(getPrepareProgramsLogFile(), "");
};

export const getDevnetLogFile = () => {
  return `${LOG_RUN_DIR}/devnet.log`;
};

export const getTestLogFile = () => {
  return `${LOG_RUN_DIR}/jasmine.log`;
};

export const getPrepareProgramsLogFile = () => {
  return `${LOG_RUN_DIR}/programs.log`;
};
