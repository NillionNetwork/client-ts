import { create } from "@bufbuild/protobuf";
import { createClient } from "@connectrpc/connect";
import { parse as parseUuid } from "uuid";
import { z } from "zod";
import { PriceQuoteRequestSchema } from "#/gen-proto/nillion/payments/v1/quote_pb";
import type { SignedReceipt } from "#/gen-proto/nillion/payments/v1/receipt_pb";
import type { Permissions as PermissionsProto } from "#/gen-proto/nillion/permissions/v1/permissions_pb";
import { RetrievePermissionsRequestSchema } from "#/gen-proto/nillion/permissions/v1/retrieve_pb";
import { Permissions } from "#/gen-proto/nillion/permissions/v1/service_pb";
import { Uuid } from "#/types/types";
import { ValuesPermissions } from "#/types/values-permissions";
import { collapse } from "#/util";
import type { VmClient } from "#/vm/client";
import type { Operation } from "#/vm/operation/operation";

export const RetrievePermissionsConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
  id: Uuid,
});
export type RetrievePermissionsConfig = z.infer<
  typeof RetrievePermissionsConfig
>;

export class RetrievePermissions implements Operation<ValuesPermissions> {
  private constructor(private readonly config: RetrievePermissionsConfig) {}

  async invoke(): Promise<ValuesPermissions> {
    const { nodes } = this.config.vm.config;

    const signedReceipt = await this.pay();

    const promises = nodes.map((node) => {
      const client = createClient(Permissions, node.transport);
      return client.retrievePermissions(
        create(RetrievePermissionsRequestSchema, {
          signedReceipt,
        }),
      );
    });

    const results = await Promise.all(promises);
    const result = collapse<PermissionsProto>(results);
    return ValuesPermissions.from(result);
  }

  private async pay(): Promise<SignedReceipt> {
    const {
      id,
      vm: { payer },
    } = this.config;

    return payer.payForOperation(
      create(PriceQuoteRequestSchema, {
        operation: {
          case: "retrievePermissions",
          value: {
            valuesId: parseUuid(id),
          },
        },
      }),
    );
  }

  static new(config: RetrievePermissionsConfig): RetrievePermissions {
    return new RetrievePermissions(config);
  }
}

export class RetrievePermissionsBuilder {
  private _id?: Uuid;
  private constructor(private readonly vm: VmClient) {}

  id(value: Uuid): this {
    this._id = value;
    return this;
  }

  build(): RetrievePermissions {
    const config = RetrievePermissionsConfig.parse({
      vm: this.vm,
      id: this._id,
    });
    return RetrievePermissions.new(config);
  }

  static init = (vm: VmClient): RetrievePermissionsBuilder =>
    new RetrievePermissionsBuilder(vm);
}
