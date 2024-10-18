import { create } from "@bufbuild/protobuf";
import { createClient } from "@connectrpc/connect";
import { sha256 } from "@noble/hashes/sha2";
import { z } from "zod";

import {
  PreprocessingRequirement,
  PriceQuoteRequestSchema,
  ProgramMetadataSchema,
} from "@nillion/client-vms/gen-proto/nillion/payments/v1/quote_pb";
import { SignedReceipt } from "@nillion/client-vms/gen-proto/nillion/payments/v1/receipt_pb";
import { Programs } from "@nillion/client-vms/gen-proto/nillion/programs/v1/service_pb";
import { StoreProgramRequestSchema } from "@nillion/client-vms/gen-proto/nillion/programs/v1/store_pb";
import { PaymentClient } from "@nillion/client-vms/payment";
import { collapse } from "@nillion/client-vms/util";
import { VmClient } from "@nillion/client-vms/vm/client";
import { ProgramMetadata } from "@nillion/client-wasm";

import { Operation } from "./operation";

export const StoreProgramConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
  name: z.string().min(1).max(100),
  program: z.instanceof(Uint8Array),
});
export type StoreProgramConfig = z.infer<typeof StoreProgramConfig>;

export type ProgramId = string;

export class StoreProgram implements Operation<ProgramId> {
  private constructor(private readonly config: StoreProgramConfig) {}

  private get payer(): PaymentClient {
    return this.config.vm.config.payer;
  }

  async invoke(): Promise<ProgramId> {
    const { program } = this.config;
    const { nodes } = this.config.vm.config;
    const signedReceipt = await this.pay();

    const promises = nodes.map((node) => {
      const client = createClient(Programs, node.transport);
      return client.storeProgram(
        create(StoreProgramRequestSchema, {
          signedReceipt,
          program,
        }),
      );
    });

    const results = (await Promise.all(promises)).map((e) => e.programId);
    return collapse(results);
  }

  private pay(): Promise<SignedReceipt> {
    const {
      name,
      program,
      vm: {
        config: { payer },
      },
    } = this.config;

    const contentsSha256 = sha256(program);
    const metadata = new ProgramMetadata(program);

    return payer.payForOperation(
      create(PriceQuoteRequestSchema, {
        operation: {
          case: "storeProgram",
          value: {
            name,
            contentsSha256,
            metadata: create(ProgramMetadataSchema, {
              programSize: metadata.memory_size(),
              memorySize: metadata.memory_size(),
              instructionCount: metadata.total_instructions(),
              instructions: metadata.instructions() as Record<string, bigint>,
              preprocessingRequirements:
                metadata.preprocessing_requirements() as unknown as PreprocessingRequirement[],
            }),
          },
        },
      }),
    );
  }

  static new(config: StoreProgramConfig): StoreProgram {
    return new StoreProgram(config);
  }
}

export class StoreProgramBuilder {
  private _name?: string;
  private _program?: Uint8Array;

  private constructor(private readonly vm: VmClient) {}

  name(value: string): this {
    this._name = value;
    return this;
  }

  program(value: Uint8Array): this {
    this._program = value;
    return this;
  }

  build(): StoreProgram {
    const config = StoreProgramConfig.parse({
      vm: this.vm,
      name: this._name,
      program: this._program,
    });
    return StoreProgram.new(config);
  }

  static init = (vm: VmClient): StoreProgramBuilder =>
    new StoreProgramBuilder(vm);
}
