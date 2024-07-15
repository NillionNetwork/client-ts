import { ExecuteOperationArgs } from "./operation";

export type ClusterDescriptorRetrieveArgs = {
  program: Uint8Array;
};

export class ClusterDescriptorRetrieve {
  constructor(private args: ClusterDescriptorRetrieveArgs) {}

  toString(): string {
    return `Operation(type="ClusterDescriptorRetrieve")`;
  }

  async execute(_args: ExecuteOperationArgs): Promise<string> {
    throw "not implemented";
  }
}
