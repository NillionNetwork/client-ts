import debug from "debug";
import { format } from "date-fns";
import fs from "node:fs";
import path from "node:path";

debug.enable("nillion:*");
export const Log = debug("nillion:fixture");
Log.log = console.log.bind(console);

const formattedDate = format(new Date(), "yyyy-MM-dd_HH-mm-ss");
export const LOG_RUN_DIR = path.resolve(`./logs/${formattedDate}`);

export const setupLoggingDir = () => {
  fs.mkdirSync(LOG_RUN_DIR);
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
