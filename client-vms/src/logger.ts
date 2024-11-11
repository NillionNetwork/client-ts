import pino, { type Logger } from "pino";

export const Log = createLogger();

function createLogger(): Logger<never, boolean> {
  const isBrowser = Boolean(globalThis.window);

  if (isBrowser) {
    return pino({
      level: "debug",
    });
  }

  return pino({
    level: "debug",
    transport: {
      target: "pino-pretty",
    },
  });
}
