import { create } from "@bufbuild/protobuf";
import { createClient } from "@connectrpc/connect";
import { parse as parseUuid } from "uuid";
import { z } from "zod";

import { DeleteValuesRequestSchema } from "@nillion/client-vms/gen-proto/nillion/values/v1/delete_pb";
import { Values } from "@nillion/client-vms/gen-proto/nillion/values/v1/service_pb";
import { Uuid } from "@nillion/client-vms/types";
import { VmClient } from "@nillion/client-vms/vm/client";
import { Operation } from "@nillion/client-vms/vm/operation/operation";

export const DeleteValuesConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
  id: Uuid,
});
export type DeleteValuesConfig = z.infer<typeof DeleteValuesConfig>;

export class DeleteValues implements Operation<Uuid> {
  readonly name = "operation-name";

  private constructor(private readonly config: DeleteValuesConfig) {}

  async invoke(): Promise<Uuid> {
    const { vm, id } = this.config;
    const { nodes } = vm.config;

    const valuesId = parseUuid(id);

    const promises = nodes.map((node) => {
      const client = createClient(Values, node.transport);
      const request = create(DeleteValuesRequestSchema, {
        valuesId,
      });
      return client.deleteValues(request);
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
