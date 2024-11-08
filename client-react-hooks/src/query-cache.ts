import type { QueryClient, QueryKey } from "@tanstack/react-query";

export const REACT_QUERY_STATE_KEY_PREFIX = "__NILLION";

export const createPoolStatusCacheKey = (): readonly unknown[] => [
  REACT_QUERY_STATE_KEY_PREFIX,
  "POOL_STATUS",
];

export const createStoreCacheKey = (id: string): readonly unknown[] => [
  REACT_QUERY_STATE_KEY_PREFIX,
  "STORE",
  id,
];

export const createPermissionsCacheKey = (id: string): readonly unknown[] => [
  REACT_QUERY_STATE_KEY_PREFIX,
  "PERMISSIONS",
  id,
];

export const createComputeResultCacheKey = (id: string): readonly unknown[] => [
  REACT_QUERY_STATE_KEY_PREFIX,
  "COMPUTE",
  id,
];

type CacheCheckResult<T> =
  | {
      hit: false;
    }
  | {
      hit: true;
      data: T;
    };

export function checkCache<T>(
  client: QueryClient,
  key: QueryKey,
  staleAfterSeconds: number,
): CacheCheckResult<T> {
  const cachedState = client.getQueryState<T>(key);

  if (!cachedState) {
    return { hit: false };
  }

  const { dataUpdatedAt, status, data } = cachedState;
  const isStale = Date.now() - dataUpdatedAt > staleAfterSeconds * 1000;
  const isValid = status === "success" && data !== undefined && !isStale;

  return isValid && data ? { hit: true, data } : { hit: false };
}
