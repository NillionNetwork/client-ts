export const websocket_transport = () => ({
  dial,
  listen_on: (e) => {
    let r = new Error(
      "Listening on WebSockets is not possible from within a browser",
    );
    throw ((r.name = "NotSupportedError"), r);
  },
});
const multiaddr_to_ws = (e) => {
    let r = e.match(
      /^\/(ip4|ip6|dns4|dns6|dns)\/(.*?)\/tcp\/(.*?)\/(ws|wss|x-parity-ws\/(.*)|x-parity-wss\/(.*))(|\/p2p\/[a-zA-Z0-9]+)$/,
    );
    if (null != r) {
      let e = "wss";
      ("ws" == r[4] || r[4].startsWith("x-parity-ws/")) && (e = "ws");
      let o = decodeURIComponent(r[5] || r[6] || "");
      return "ip6" == r[1]
        ? e + "://[" + r[2] + "]:" + r[3] + o
        : e + "://" + r[2] + ":" + r[3] + o;
    }
    let o = new Error("Address not supported: " + e);
    throw ((o.name = "NotSupportedError"), o);
  },
  dial = (e) => {
    let r = new WebSocket(multiaddr_to_ws(e));
    r.binaryType = "arraybuffer";
    let o = read_queue();
    return new Promise((e, t) => {
      (r.onerror = (e) => {
        t(e), o.inject_eof();
      }),
        (r.onclose = (e) => {
          t(e), o.inject_eof();
        }),
        (r.onmessage = (e) => o.inject_array_buffer(e.data)),
        (r.onopen = () =>
          e({
            read: (function* () {
              for (; 1 == r.readyState; ) yield o.next();
            })(),
            write: (e) =>
              1 == r.readyState
                ? (r.send(e.slice(0)), promise_when_send_finished(r))
                : Promise.reject("WebSocket is closed"),
            shutdown: () => r.close(),
            close: () => {},
          }));
    });
  },
  promise_when_send_finished = (e) =>
    new Promise((r, o) => {
      !(function t() {
        1 == e.readyState
          ? e.bufferedAmount < 8192
            ? r()
            : setTimeout(t, 100)
          : o("WebSocket is closed");
      })();
    }),
  read_queue = () => {
    let e = { queue: new Array(), resolve: null };
    return {
      inject_array_buffer: (r) => {
        null != e.resolve
          ? (e.resolve(r), (e.resolve = null))
          : e.queue.push(Promise.resolve(r));
      },
      inject_eof: () => {
        null != e.resolve
          ? (e.resolve(null), (e.resolve = null))
          : e.queue.push(Promise.resolve(null));
      },
      next: () => {
        if (0 != e.queue.length) return e.queue.shift(0);
        if (null !== e.resolve)
          throw "Internal error: already have a pending promise";
        return new Promise((r, o) => {
          e.resolve = r;
        });
      },
    };
  };
