export interface Operation<Output> {
  invoke: () => Promise<Output>;
}
