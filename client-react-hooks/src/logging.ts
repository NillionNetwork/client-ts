import pino, { type Logger } from "pino";

export const Log = createLogger();

function createLogger(): Logger<never, boolean> {
  const isBrowser = Boolean(globalThis.window);

  if (isBrowser) {
    // @ts-ignore
    return pino({
      level: "debug",
      browser: {
        asObject: true,
        formatters: {
          level(label, _numberical) {
            return { level: label };
          },
        },
        // write: (obj: {
        //   level: string;
        //   module: string;
        //   msg: string | object;
        //   time: number | string;
        //   [key: string]: any;
        // }) => {
        //   debugger;
        //   const time = new Date(obj.time).toLocaleTimeString();
        //   const { level, module, msg, time: _, ...rest } = obj;
        //   const baseMsg = `${time} ${level.toUpperCase()} ${module}:`;
        //
        //   if (typeof msg === "object") {
        //     console.log(`${baseMsg} %O`, { ...msg, ...rest });
        //   } else if (Object.keys(rest).length > 0) {
        //     console.log(`${baseMsg} ${msg ?? ""} %O`, rest);
        //   } else {
        //     console.log(`${baseMsg} ${msg ?? ""}`.trim());
        //   }
        //
        //   console.log(baseMsg);
        // },
      },
    }).child({ module: "client-react-hooks" });
  }

  return pino({
    level: "debug",
    transport: {
      target: "pino-pretty",
    },
  }).child({ module: "client-react-hooks" });
}
