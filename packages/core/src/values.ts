import { z } from "zod";

export const StoreId = z.string().uuid().brand<"StoreId">();
export type StoreId = z.infer<typeof StoreId>;

export const ResultId = z.string().uuid().brand<"ResultId">();
export type ResultId = z.infer<typeof ResultId>;

export const ChainId = z.string().min(1).brand<"ChainId">();
export type ChainId = z.infer<typeof ChainId>;

export const ClusterId = z.string().min(1).brand<"ClusterId">();
export type ClusterId = z.infer<typeof ClusterId>;

export const ChainEndpoint = z.string().url().brand<"ChainEndpoint">();
export type ChainEndpoint = z.infer<typeof ChainEndpoint>;

// source: libp2p-wasm-ext websocket.js
const multiaddrRegex =
  /^\/(ip4|ip6|dns4|dns6|dns)\/(.*?)\/tcp\/(.*?)\/(ws|wss|x-parity-ws\/(.*)|x-parity-wss\/(.*))(|\/p2p\/[a-zA-Z0-9]+)$/;
export const Multiaddr = z.string().regex(multiaddrRegex).brand<"Multiaddr">();
export type Multiaddr = z.infer<typeof Multiaddr>;
