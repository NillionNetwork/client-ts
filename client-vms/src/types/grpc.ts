import type { DescService } from "@bufbuild/protobuf";
import type { Client, Transport } from "@connectrpc/connect";
import type { OfflineSigner } from "@cosmjs/proto-signing";
import { z } from "zod";

export const GrpcTransport = z.custom<Transport>((value: unknown) =>
  Boolean(value),
);
export type GrpcTransport = z.infer<typeof GrpcTransport>;

export const AuthenticatedGrpcTransport = z.custom<Transport>(
  (value: unknown) => Boolean(value),
);
export type AuthenticatedGrpcTransport = z.infer<
  typeof AuthenticatedGrpcTransport
>;

export const GrpcClient = z.custom<Client<DescService>>(
  (value: unknown) => value !== null && typeof value === "object",
);

export const OfflineSignerSchema = z.custom<OfflineSigner>((value: unknown) => {
  return (
    value !== null &&
    typeof value === "object" &&
    "getAccounts" in value &&
    "signDirect" in value
  );
});
