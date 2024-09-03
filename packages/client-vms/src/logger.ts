import debug from "debug";

export const Log = debug("nillion:vms");
Log.log = console.log.bind(console);
