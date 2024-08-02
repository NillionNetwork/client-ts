export function startWorker(module, memory, state, opts, helper) {
  console.log("nillion:wasm Loading wasm web worker.");
  const worker = new Worker(new URL("./worker.js", import.meta.url), opts);
  worker.postMessage([module, memory, state, helper.mainJS()]);
  return Promise.resolve();
}
