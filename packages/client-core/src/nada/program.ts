import * as Wasm from "@nillion/client-wasm";

import { Log } from "../logger";
import { PartyId, PartyName, ProgramId } from "../types";

export class ProgramBindings {
  private constructor(
    public id: ProgramId,
    public inputs = new Map<PartyName, PartyId>(),
    public outputs = new Map<PartyName, PartyId>(),
  ) {}

  addInputParty(name: PartyName, id: PartyId): this {
    Log(`add input party name=${name} with id=${id}`);
    if (this.inputs.has(name)) {
      Log(`input party exists, overwriting`);
    }
    this.inputs.set(name, id);
    return this;
  }

  addOutputParty(name: PartyName, id: PartyId): this {
    Log(`add output party name=${name} with id=${id}`);
    if (this.outputs.has(name)) {
      Log(`output party exists, overwriting`);
    }
    this.outputs.set(name, id);
    return this;
  }

  into(): Wasm.ProgramBindings {
    if (this.inputs.size === 0 && this.outputs.size === 0) {
      Log("program has no inputs our outputs");
    }

    const program = new Wasm.ProgramBindings(this.id);
    for (const [name, id] of this.inputs) {
      program.add_input_party(name, id);
    }

    for (const [name, id] of this.outputs) {
      program.add_output_party(name, id);
    }

    return program;
  }

  toString(): string {
    return `ProgramBindings(id=${this.id})`;
  }

  static create(id: string): ProgramBindings {
    const parsed = ProgramId.parse(id);
    return new ProgramBindings(parsed);
  }
}
