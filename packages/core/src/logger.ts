import debug from "debug";

debug.enable("nillion:core");
export const Log = debug("nillion:core");
Log.log = console.log.bind(console);
