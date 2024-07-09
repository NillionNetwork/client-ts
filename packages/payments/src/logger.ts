import debug from "debug";

debug.enable("nillion:payments");
export const Log = debug("nillion:payments");
Log.log = console.log.bind(console);
