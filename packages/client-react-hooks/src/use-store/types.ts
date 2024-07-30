import { StoreId } from "@nillion/client-core";

export const REACT_QUERY_STATE_KEY_PREFIX = "__NILLION";

export const createStoreCacheKey = (id: StoreId | string | null): unknown[] => [
  REACT_QUERY_STATE_KEY_PREFIX,
  "STORE",
  id,
];

export const createPermissionsCacheKey = (
  id: StoreId | string | null,
): unknown[] => [REACT_QUERY_STATE_KEY_PREFIX, "PERMISSIONS", id];
