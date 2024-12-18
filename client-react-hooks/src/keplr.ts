import type { Keplr } from "@keplr-wallet/types";
import type { Window as KeplrWindow } from "@keplr-wallet/types/build/window";

declare global {
  interface Window extends KeplrWindow {}
}

export const getKeplr = async (): Promise<Keplr> => {
  if (window.keplr) {
    return window.keplr;
  }

  if (document.readyState === "complete") {
    if (window.keplr) {
      return window.keplr;
    }
    return Promise.reject(new Error("Failed to find keplr"));
  }

  return new Promise((resolve, reject) => {
    const onReadyStateChange = () => {
      if (document.readyState === "complete") {
        document.removeEventListener("readystatechange", onReadyStateChange);
        if (window.keplr) {
          resolve(window.keplr);
        } else {
          reject(new Error("Failed to find keplr"));
        }
      }
    };

    document.addEventListener("readystatechange", onReadyStateChange);
  });
};
