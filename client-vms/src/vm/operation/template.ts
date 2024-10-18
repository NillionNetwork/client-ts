import { z } from "zod";

import { SignedReceipt } from "@nillion/client-vms/gen-proto/nillion/payments/v1/receipt_pb";
import { VmClient } from "@nillion/client-vms/vm/client";
import { Operation } from "@nillion/client-vms/vm/operation/operation";

export const FooConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
});
export type FooConfig = z.infer<typeof FooConfig>;

export class Foo implements Operation<null> {
  private constructor(private readonly config: FooConfig) {}

  invoke(): Promise<null> {
    return Promise.resolve(null);
  }

  // eslint-disable-next-line
  private async pay(): Promise<SignedReceipt> {
    // @ts-expect-error this is a template
    return null;
  }

  static new(config: FooConfig): Foo {
    return new Foo(config);
  }
}

export class FooBuilder {
  private constructor(private readonly vm: VmClient) {}

  build(): Foo {
    const config = FooConfig.parse({
      vm: this.vm,
    });
    return Foo.new(config);
  }

  static init = (vm: VmClient): FooBuilder => new FooBuilder(vm);
}
