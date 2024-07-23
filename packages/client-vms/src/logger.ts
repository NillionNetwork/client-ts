import debug from "debug";

export const Log = debug("nillion:client");
Log.log = console.log.bind(console);
