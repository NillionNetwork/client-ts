import { Log } from "./logging";

export const sleep = (ms: number) =>
  new Promise((resolve) => {
    Log("Sleeping for %d ms.", ms);
    setTimeout(resolve, ms);
  });
