export const Log = (...args) => {
  let debug = "";
  if (
    typeof localStorage !== "undefined" &&
    typeof localStorage.debug !== "undefined"
  ) {
    debug = localStorage.debug;
  }
  if (debug.includes("nillion:*") || debug.includes("nillion:wasm")) {
    // Light green color start, then reset to default
    const prefix = "\x1b[92mnillion:wasm\x1b[0m";
    console.log(prefix, ...args);
  }
};
