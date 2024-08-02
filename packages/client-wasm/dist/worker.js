if (
  typeof WorkerGlobalScope !== "undefined" &&
  self instanceof WorkerGlobalScope
) {
  self.onerror = (event) => {
    console.error("nillion:wasm Error: ", event);
  };

  self.onmessage = async (event) => {
    if (Array.isArray(event.data)) {
      try {
        let [module, memory, state, pathToWasmIndexJs] = event.data;

        const importFrom =
          typeof __webpack_require__ === "function"
            ? import("./index.js")
            : import(pathToWasmIndexJs);

        const wasm = await importFrom;
        await wasm.default(module, memory);
        wasm.worker_entry_point(state);
        console.log("nillion:wasm Worker started.");
      } catch (err) {
        console.error(err);
        self.close();
      }
    } else {
      console.log("nillion:wasm Unhandled message: ", event);
    }
  };
}
