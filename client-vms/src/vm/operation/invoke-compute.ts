import { create } from "@bufbuild/protobuf";
import { createClient } from "@connectrpc/connect";
import {
  type NadaValue,
  NadaValues,
  compute_values_size,
  encode_values,
} from "@nillion/client-wasm";
import { parse as parseUuid, stringify as stringifyUuid } from "uuid";
import { z } from "zod";
import {
  InputPartyBindingSchema,
  InvokeComputeRequestSchema,
  OutputPartyBindingSchema,
} from "#/gen-proto/nillion/compute/v1/invoke_pb";
import { Compute } from "#/gen-proto/nillion/compute/v1/service_pb";
import { PriceQuoteRequestSchema } from "#/gen-proto/nillion/payments/v1/quote_pb";
import type { SignedReceipt } from "#/gen-proto/nillion/payments/v1/receipt_pb";
import {
  InputBindings,
  OutputBindings,
  PartyId,
  ProgramId,
  Uuid,
} from "#/types/types";
import type { UserId } from "#/types/user-id";
import { collapse } from "#/util";
import type { VmClient } from "#/vm/client";
import type { Operation } from "#/vm/operation/operation";

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

export class InvokeCompute implements Operation<Uuid> {
  private constructor(private readonly config: InvokeComputeConfig) {}

  async invoke(): Promise<Uuid> {
    const { nodes, masker } = this.config.vm;

    const signedReceipt = await this.pay();
    const shares = masker.mask(this.config.computeTimeValues).map((share) => ({
      node: PartyId.from(share.party.to_byte_array()),
      bincodeValues: encode_values(share.shares),
    }));
    const valueIds = this.config.valueIds.map(parseUuid);

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

    const promises = nodes.map((node) => {
      const client = createClient(Compute, node.transport);
      const share = shares.find(
        (share) => share.node.toBase64() === node.id.toBase64(),
      );

      if (!share) {
        throw new Error("Failed to match share.party with a known node.id");
      }

      return client.invokeCompute(
        create(InvokeComputeRequestSchema, {
          signedReceipt,
          valueIds,
          bincodeValues: share.bincodeValues,
          inputBindings,
          outputBindings,
        }),
      );
    });

    const results = (await Promise.all(promises)).map((e) => e.computeId);
    return stringifyUuid(collapse(results));
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
