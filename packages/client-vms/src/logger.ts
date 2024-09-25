import debug from "debug";

/*
 * `Log` is a debug logger that can be used to log messages to the console.
 * @param message: string
 */
export const Log = debug("nillion:vms");
Log.log = console.log.bind(console);
