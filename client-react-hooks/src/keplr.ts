import type { Keplr } from "@keplr-wallet/types";
import type { Window as KeplrWindow } from "@keplr-wallet/types/build/window";

declare global {
  interface Window extends KeplrWindow {}
}

export const getKeplr = async (): Promise<Keplr> => {
  if (window.keplr) {
    return window.keplr;
  }

  if (document.readyState === "complete" && window.keplr) {
    return window.keplr;
  }

  return new Promise((resolve) => {
    const documentStateChange = (event: Event) => {
      if (
        event.target &&
        (event.target as Document).readyState === "complete"
      ) {
        if (window.keplr) {
          resolve(window.keplr);
          document.removeEventListener("readystatechange", documentStateChange);
        } else {
          throw new Error("Failed to find keplr");
        }
      }
    };

    document.addEventListener("readystatechange", documentStateChange);
  });
};
