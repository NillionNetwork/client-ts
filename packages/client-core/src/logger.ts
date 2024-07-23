import debug from "debug";

export const Log = debug("nillion:core");
Log.log = console.log.bind(console);
