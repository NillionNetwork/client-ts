import debug from "debug";

export const Log = debug("nillion:payments");
Log.log = console.log.bind(console);
