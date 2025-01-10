import { create } from "@bufbuild/protobuf";
import { type Client, createClient } from "@connectrpc/connect";
import { ProgramMetadata } from "@nillion/client-wasm";
import { sha256 } from "@noble/hashes/sha2";
import { Effect as E, pipe } from "effect";
import type { UnknownException } from "effect/Cause";
import { z } from "zod";
import {
  type PreprocessingRequirement,
  PriceQuoteRequestSchema,
  ProgramMetadataSchema,
} from "#/gen-proto/nillion/payments/v1/quote_pb";
import type { SignedReceipt } from "#/gen-proto/nillion/payments/v1/receipt_pb";
import { Programs } from "#/gen-proto/nillion/programs/v1/service_pb";
import {
  type StoreProgramRequest,
  StoreProgramRequestSchema,
} from "#/gen-proto/nillion/programs/v1/store_pb";
import { Log } from "#/logger";
import { type PartyId, ProgramId, ProgramName } from "#/types/types";
import { collapse, unwrapExceptionCause } from "#/util";
import type { VmClient } from "#/vm/client";
import type { Operation } from "#/vm/operation/operation";
import { retryGrpcRequestIfRecoverable } from "#/vm/operation/retry-client";

export const StoreProgramConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
  name: z.string().min(1).max(100),
  program: z.instanceof(Uint8Array),
});
export type StoreProgramConfig = z.infer<typeof StoreProgramConfig>;

type NodeRequestOptions = {
  nodeId: PartyId;
  client: Client<typeof Programs>;
  request: StoreProgramRequest;
};

export class StoreProgram implements Operation<ProgramId> {
  private constructor(private readonly config: StoreProgramConfig) {}

  async invoke(): Promise<ProgramId> {
    return pipe(
      E.tryPromise(() => this.pay()),
      E.map((receipt) => this.prepareRequestPerNode(receipt)),
      E.flatMap(E.all),
      E.map((requests) =>
        requests.map((request) =>
          retryGrpcRequestIfRecoverable<ProgramId>(
            "StoreProgram",
            this.invokeNodeRequest(request),
          ),
        ),
      ),
      E.flatMap((effects) =>
        E.all(effects, { concurrency: this.config.vm.nodes.length }),
      ),
      E.flatMap(collapse),
      E.catchAll(unwrapExceptionCause),
      E.tapBoth({
        onFailure: (e) => E.sync(() => Log("Store program failed: %O", e)),
        onSuccess: (id) => E.sync(() => Log(`Stored program: ${id}`)),
      }),
      E.runPromise,
    );
  }

  prepareRequestPerNode(
    signedReceipt: SignedReceipt,
  ): E.Effect<NodeRequestOptions, UnknownException>[] {
    return this.config.vm.nodes.map((node) =>
      E.succeed({
        nodeId: node.id,
        client: createClient(Programs, node.transport),
        request: create(StoreProgramRequestSchema, {
          signedReceipt,
          program: this.config.program,
        }),
      }),
    );
  }

  invokeNodeRequest(
    options: NodeRequestOptions,
  ): E.Effect<ProgramId, UnknownException> {
    const { nodeId, client, request } = options;
    return pipe(
      E.tryPromise(() => client.storeProgram(request)),
      E.map((response) => ProgramId.parse(response.programId)),
      E.tap((id) =>
        Log(`Stored program: node=${nodeId.toBase64()} values=${id} `),
      ),
    );
  }

  private pay(): Promise<SignedReceipt> {
    const {
      name,
      program,
      vm: { payer },
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
  private _name?: ProgramName;
  private _program?: Uint8Array;

  private constructor(private readonly vm: VmClient) {}

  name(value: ProgramName | string): this {
    this._name = ProgramName.parse(value);
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
