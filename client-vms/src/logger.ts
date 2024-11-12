import pino, { type Logger } from "pino";

export const Log = createLogger("@nillion/client-vm");

type PinoWriteFnArgs = {
  time: number;
  level: string;
  module: string;
  msg: string | object;
  [index: string]: unknown;
};

const levelColors: Record<string, string> = {
  debug: "#808080",
  info: "#0099ff",
  warn: "#ffa500",
  error: "#ff0000",
  fatal: "#800000",
  trace: "#a0a0a0",
};

export function createLogger(module: string): Logger<never, boolean> {
  const isBrowser = Boolean(globalThis.window);

  if (isBrowser) {
    return pino({
      level: "debug",
      browser: {
        asObject: true,
        formatters: {
          level(label, _numerical) {
            return { level: label };
          },
        },
        // @ts-expect-error args type is customised through `child` and `formatters` which pino doesn't recognize
        write: (args: PinoWriteFnArgs) => {
          if (!localStorage.debug?.includes("@nillion")) {
            return;
          }

          const time = new Date(args.time).toLocaleTimeString();
          const { level, module, msg, time: _, ...rest } = args;
          const color = levelColors[level.toLowerCase()] || "#000000";
          const style = `color: ${color}; font-weight: bold`;
          const baseMsg = `${time} %c${level.toUpperCase().padEnd(5)}%c ${module}:`;

          const logArgs: unknown[] = [baseMsg, style, ""];

          if (typeof msg === "object") {
            logArgs[0] += " %O";
            logArgs.push({ ...msg, ...rest });
          } else {
            if (msg) {
              logArgs[0] += ` ${msg}`;
            }
            if (Object.keys(rest).length > 0) {
              logArgs[0] += " %O";
              logArgs.push(rest);
            }
          }

          console.log(...logArgs);
        },
      },
    }).child({ module });
  }

  return pino({
    level: "debug",
    transport: {
      target: "pino-pretty",
    },
  }).child({ module });
}
