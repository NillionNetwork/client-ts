export const REACT_QUERY_STATE_KEY_PREFIX = "__NILLION";

export const createKey = (id: unknown): string[] => [
  REACT_QUERY_STATE_KEY_PREFIX,
  JSON.stringify(id),
];
