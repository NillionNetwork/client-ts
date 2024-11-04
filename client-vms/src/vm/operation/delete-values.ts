import { create } from "@bufbuild/protobuf";
import { createClient } from "@connectrpc/connect";
import { parse as parseUuid } from "uuid";
import { z } from "zod";

import { DeleteValuesRequestSchema } from "#/gen-proto/nillion/values/v1/delete_pb";
import { Values } from "#/gen-proto/nillion/values/v1/service_pb";
import { Uuid } from "#/types";
import type { VmClient } from "#/vm/client";
import type { Operation } from "#/vm/operation/operation";

export const DeleteValuesConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
  id: Uuid,
});
export type DeleteValuesConfig = z.infer<typeof DeleteValuesConfig>;

export class DeleteValues implements Operation<Uuid> {
  private constructor(private readonly config: DeleteValuesConfig) {}

  async invoke(): Promise<Uuid> {
    const {
      vm: { nodes },
      id,
    } = this.config;

    const valuesId = parseUuid(id);

    const promises = nodes.map((node) => {
      const client = createClient(Values, node.transport);
      return client.deleteValues(
        create(DeleteValuesRequestSchema, {
          valuesId,
        }),
      );
    });

    const results = await Promise.all(promises);
    if (results.length !== nodes.length)
      throw new Error("Results length does not match nodes length");

    return id;
  }

  static new(config: DeleteValuesConfig): DeleteValues {
    return new DeleteValues(config);
  }
}

export class DeleteValuesBuilder {
  private _id?: Uuid;

  private constructor(private readonly vm: VmClient) {}

  id(value: Uuid): this {
    this._id = value;
    return this;
  }

  build(): DeleteValues {
    const config = DeleteValuesConfig.parse({
      vm: this.vm,
      id: this._id,
    });
    return DeleteValues.new(config);
  }

  static init = (vm: VmClient): DeleteValuesBuilder =>
    new DeleteValuesBuilder(vm);
}
