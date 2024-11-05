import pino from "pino";

export const Log = pino({
  level: "debug",
  transport: {
    target: "pino-pretty",
  },
});
