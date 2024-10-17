export interface Operation<Output> {
  readonly name: string;
  invoke: () => Promise<Output>;
}
