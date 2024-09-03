import { ComputeOutputId, StoreId } from "@nillion/client-core";

export const REACT_QUERY_STATE_KEY_PREFIX = "__NILLION";

export const createStoreCacheKey = (
  id: StoreId | string,
): readonly unknown[] => [REACT_QUERY_STATE_KEY_PREFIX, "STORE", id];

export const createPermissionsCacheKey = (
  id: StoreId | string | null,
): readonly unknown[] => [REACT_QUERY_STATE_KEY_PREFIX, "PERMISSIONS", id];

export const createComputeResultCacheKey = (
  id: ComputeOutputId | string,
): readonly unknown[] => [REACT_QUERY_STATE_KEY_PREFIX, "COMPUTE", id];
