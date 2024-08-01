export interface TaggedError extends Error {
  readonly _tag: string;
}

export const isTaggedError = (e: unknown): e is TaggedError => {
  return e instanceof Error && "_tag" in e;
};
