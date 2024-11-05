import { ComputeOutputId, StoreId } from "@nillion/client-core";

/** `REACT_QUERY_STATE_KEY_PREFIX` is a string that is used to prefix the cache keys */
export const REACT_QUERY_STATE_KEY_PREFIX = "__NILLION";

/** `createStoreCacheKey` is a function that takes a `StoreId` or `string` and returns a cache key */
export const createStoreCacheKey = (
  id: StoreId | string,
): readonly unknown[] => [REACT_QUERY_STATE_KEY_PREFIX, "STORE", id];

/** `createPermissionsCacheKey` is a function that takes a `StoreId` or `string` or `null` and returns a cache key */
export const createPermissionsCacheKey = (
  id: StoreId | string | null,
): readonly unknown[] => [REACT_QUERY_STATE_KEY_PREFIX, "PERMISSIONS", id];

/** `createComputeResultCacheKey` is a function that takes a `ComputeOutputId` or `string` and returns a cache key */
export const createComputeResultCacheKey = (
  id: ComputeOutputId | string,
): readonly unknown[] => [REACT_QUERY_STATE_KEY_PREFIX, "COMPUTE", id];
