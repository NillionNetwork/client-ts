export function startWorker(e, o, t, r, s) {
  const a = new Worker(new URL("./worker.js", import.meta.url), r);
  return (
    a.postMessage([e, o, t, s.mainJS()]),
    new Promise((e, o) => {
      (a.onmessage = (o) => {
        "started" === o.data && e();
      }),
        (a.onerror = o);
    })
  );
}

"WorkerGlobalScope" in self &&
  self instanceof WorkerGlobalScope &&
  (self.onmessage = async (e) => {
    let [o, t, r, s] = e.data;
    const a =
      "function" == typeof __webpack_require__
        ? import("../../../index.js")
        : import(s);
    try {
      const { default: e, worker_entry_point: s } = await a;
      await e(o, t),
        s(r),
        postMessage("started"),
        (self.onmessage = (e) => {
          console.error("Unexpected message", e);
        });
    } catch (e) {
      throw (
        (setTimeout(() => {
          throw e;
        }),
        e)
      );
    }
  });
