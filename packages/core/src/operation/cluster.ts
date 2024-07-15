import { ExecuteOperationArgs, Operation, OperationType } from "./operation";

export type ClusterDescriptorRetrieveArgs = {
  program: Uint8Array;
};

export class ClusterDescriptorRetrieve implements Operation {
  type = OperationType.enum.ClusterInfoRetrieve;

  constructor(private args: ClusterDescriptorRetrieveArgs) {}

  toString(): string {
    return `Operation(type="ClusterDescriptorRetrieve")`;
  }

  async execute(_args: ExecuteOperationArgs): Promise<string> {
    throw "not implemented";
  }
}
