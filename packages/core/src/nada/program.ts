import * as Wasm from "@nillion/client-wasm";
import { PartyId, PartyName, ProgramId } from "../types";
import { Log } from "../logger";

export class ProgramBindings {
  inputs = new Map<PartyName, PartyId>();
  outputs = new Map<PartyName, PartyId>();

  private constructor(public id: ProgramId) {}

  addInputParty(name: PartyName, id: PartyId): ProgramBindings {
    Log(`add input party name=${name} with id=${id}`);
    if (this.inputs.has(name)) {
      Log(`input party exists, overwriting`);
    }
    this.inputs.set(name, id);
    return this;
  }

  addOutputParty(name: PartyName, id: PartyId): ProgramBindings {
    Log(`add output party name=${name} with id=${id}`);
    if (this.outputs.has(name)) {
      Log(`output party exists, overwriting`);
    }
    this.outputs.set(name, id);
    return this;
  }

  toWasm(): Wasm.ProgramBindings {
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
    const inputs = this.inputs.toString();
    const outputs = this.outputs.toString();
    return `ProgramBindings(id=${this.id},inputs=${inputs},outputs=${outputs})`;
  }

  static create(id: string): ProgramBindings {
    const parsed = ProgramId.parse(id);
    return new ProgramBindings(parsed);
  }
}
