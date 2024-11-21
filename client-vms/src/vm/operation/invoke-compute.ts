import { create } from "@bufbuild/protobuf";
import { type Client, createClient } from "@connectrpc/connect";
import {
  InputPartyBindingSchema,
  type InvokeComputeRequest,
  InvokeComputeRequestSchema,
  OutputPartyBindingSchema,
} from "@nillion/client-vms/gen-proto/nillion/compute/v1/invoke_pb";
import { Compute } from "@nillion/client-vms/gen-proto/nillion/compute/v1/service_pb";
import { PriceQuoteRequestSchema } from "@nillion/client-vms/gen-proto/nillion/payments/v1/quote_pb";
import type { SignedReceipt } from "@nillion/client-vms/gen-proto/nillion/payments/v1/receipt_pb";
import { Log } from "@nillion/client-vms/logger";
import {
  InputBindings,
  OutputBindings,
  PartyId,
  ProgramId,
  Uuid,
} from "@nillion/client-vms/types/types";
import type { UserId } from "@nillion/client-vms/types/user-id";
import { collapse } from "@nillion/client-vms/util";
import type { VmClient } from "@nillion/client-vms/vm/client";
import type { Operation } from "@nillion/client-vms/vm/operation/operation";
import { retryGrpcRequestIfRecoverable } from "@nillion/client-vms/vm/operation/retry-client";
import {
  type NadaValue,
  NadaValues,
  compute_values_size,
  encode_values,
} from "@nillion/client-wasm";
import { Effect as E, pipe } from "effect";
import { UnknownException } from "effect/Cause";
import { parse, stringify } from "uuid";
import { z } from "zod";

export const InvokeComputeConfig = z.object({
  // due to import resolution order we cannot use instanceof because VmClient isn't defined first
  vm: z.custom<VmClient>(),
  programId: ProgramId,
  computeTimeValues: z.instanceof(NadaValues),
  valueIds: z.array(Uuid),
  inputBindings: z.array(InputBindings),
  outputBindings: z.array(OutputBindings),
});
export type InvokeComputeConfig = z.infer<typeof InvokeComputeConfig>;

type NodeRequestOptions = {
  nodeId: PartyId;
  client: Client<typeof Compute>;
  request: InvokeComputeRequest;
};

export class InvokeCompute implements Operation<Uuid> {
  private constructor(private readonly config: InvokeComputeConfig) {}

  async invoke(): Promise<Uuid> {
    return pipe(
      E.tryPromise(() => this.pay()),
      E.map((receipt) => this.prepareRequestPerNode(receipt)),
      E.flatMap(E.all),
      E.map((requests) =>
        requests.map((request) =>
          retryGrpcRequestIfRecoverable<Uuid>(
            "InvokeCompute",
            this.invokeNodeRequest(request),
          ),
        ),
      ),
      E.flatMap((effects) =>
        E.all(effects, { concurrency: this.config.vm.nodes.length }),
      ),
      E.flatMap(collapse),
      E.tapBoth({
        onFailure: (e) => E.sync(() => Log("Invoke compute failed: %O", e)),
        onSuccess: (id) => E.sync(() => Log(`Invoke compute: ${id}`)),
      }),
      E.runPromise,
    );
  }

  prepareRequestPerNode(
    signedReceipt: SignedReceipt,
  ): E.Effect<NodeRequestOptions, UnknownException>[] {
    const shares = this.config.vm.masker.mask(this.config.computeTimeValues);
    const valueIds = this.config.valueIds.map(parse);

    const inputBindings = this.config.inputBindings.map((bindings) =>
      create(InputPartyBindingSchema, {
        partyName: bindings.party,
        user: bindings.user.toProto(),
      }),
    );

    const outputBindings = this.config.outputBindings.map((bindings) =>
      create(OutputPartyBindingSchema, {
        partyName: bindings.party,
        users: bindings.users.map((user) => user.toProto()),
      }),
    );

    return shares.map((share) => {
      const nodeId = PartyId.from(share.party.to_byte_array());
      const node = this.config.vm.nodes.find(
        (n) => n.id.toBase64() === nodeId.toBase64(),
      );

      if (!node) {
        return E.fail(
          new UnknownException(
            `Failed to match configured nodes with share's party id:${nodeId}`,
          ),
        );
      }

      return E.succeed({
        nodeId: node.id,
        client: createClient(Compute, node.transport),
        request: create(InvokeComputeRequestSchema, {
          signedReceipt,
          valueIds,
          bincodeValues: encode_values(share.shares),
          inputBindings,
          outputBindings,
        }),
      });
    });
  }

  invokeNodeRequest(
    options: NodeRequestOptions,
  ): E.Effect<Uuid, UnknownException> {
    const { nodeId, client, request } = options;
    return pipe(
      E.tryPromise(() => client.invokeCompute(request)),
      E.map((response) => stringify(response.computeId)),
      E.tap((id) => Log(`Invoked compute: node=${nodeId.toBase64()} id=${id}`)),
    );
  }

  private async pay(): Promise<SignedReceipt> {
    const {
      programId,
      computeTimeValues,
      vm: { payer },
    } = this.config;

    return payer.payForOperation(
      create(PriceQuoteRequestSchema, {
        operation: {
          case: "invokeCompute",
          value: {
            programId,
            valuesPayloadSize: compute_values_size(computeTimeValues),
          },
        },
      }),
    );
  }

  static new(config: InvokeComputeConfig): InvokeCompute {
    return new InvokeCompute(config);
  }
}

export class InvokeComputeBuilder {
  private _programId?: ProgramId;
  private _computeTimeValues = new NadaValues();
  private _valueIds: Uuid[] = [];
  private _inputBindings: InputBindings[] = [];
  private _outputBindings: OutputBindings[] = [];
  private constructor(private readonly vm: VmClient) {}

  program(id: ProgramId): this {
    this._programId = id;
    return this;
  }

  computeTimeValues(name: string, value: NadaValue): this {
    this._computeTimeValues.insert(name, value);
    return this;
  }

  valueIds(...ids: Uuid[]): this {
    this._valueIds.push(...ids);
    return this;
  }

  inputParty(party: string, user: UserId): this {
    this._inputBindings.push({ party, user });
    return this;
  }

  outputParty(party: string, users: UserId[]): this {
    this._outputBindings.push({ party, users });
    return this;
  }

  build(): InvokeCompute {
    const config = InvokeComputeConfig.parse({
      vm: this.vm,
      programId: this._programId,
      computeTimeValues: this._computeTimeValues,
      valueIds: this._valueIds,
      inputBindings: this._inputBindings,
      outputBindings: this._outputBindings,
    });
    return InvokeCompute.new(config);
  }

  static init = (vm: VmClient): InvokeComputeBuilder =>
    new InvokeComputeBuilder(vm);
}
