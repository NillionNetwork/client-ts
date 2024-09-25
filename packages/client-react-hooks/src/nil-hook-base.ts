import { UseMutationResult } from "@tanstack/react-query";

/**
 * NilHookState is a set of states that a NilHook can be in:
 * - Idle: waiting to receive a request
 * - Loading: waiting for the request to complete
 * - Success: the request was successful
 * - Error: the request had an error
 @enum
 */
export const NilHookState = {
  Idle: {
    status: "idle",
    isIdle: true,
    isLoading: false,
    isSuccess: false,
    isError: false,
  },
  Loading: {
    status: "loading",
    isIdle: false,
    isLoading: true,
    isSuccess: false,
    isError: false,
  },
  Success: {
    status: "success",
    isIdle: false,
    isLoading: false,
    isSuccess: true,
    isError: false,
  },
  Error: {
    status: "error",
    isIdle: false,
    isLoading: false,
    isSuccess: false,
    isError: true,
  },
} as const;

/**
 * `UseNilHook` is a hook that allows you to execute a NilHook operation, and check its status.
 * @type
 */
export type UseNilHook<ExecuteArgs, ExecuteResult> = NilHookBaseResult<
  ExecuteArgs,
  ExecuteResult
> &
  (
    | NilHookIdleResult
    | NilHookLoadingResult
    | NilHookSuccessResult<ExecuteResult>
    | NilHookErrorResult
  );

/**
 * NilHookBaseResult is a set of functions that a NilHook can use.
 * @property execute - A function that executes the NilHook.
 * @property executeAsync - A function that executes the NilHook asynchronously.
 */
export interface NilHookBaseResult<ExecuteArgs, ExecuteResult> {
  execute: (args: ExecuteArgs) => void;
  executeAsync: (args: ExecuteArgs) => Promise<ExecuteResult>;
}

/**
 * NilHookIdleResult is a set of states that a NilHook can be in when it is idle.
 * @property status - The status of the NilHook.
 * @property isLoading - Whether the NilHook is loading.
 * @property isSuccess - Whether the NilHook is successful.
 * @property isError - Whether the NilHook has an error.
 * @property isIdle - Whether the NilHook is idle.
 */
export interface NilHookIdleResult {
  status: "idle";
  isLoading: false;
  isSuccess: false;
  isError: false;
  isIdle: true;
}

/**
 * NilHookLoadingResult is a set of states that a NilHook can be in when it is loading.
 * @property status - The status of the NilHook.
 * @property isLoading - Whether the NilHook is loading.
 * @property isSuccess - Whether the NilHook is successful.
 * @property isError - Whether the NilHook has an error.
 * @property isIdle - Whether the NilHook is idle.
 */
export interface NilHookLoadingResult {
  status: "loading";
  isLoading: true;
  isSuccess: false;
  isError: false;
  isIdle: false;
}

/**
 * NilHookSuccessResult is a set of states that a NilHook can be in when it is successful.
 * @property status - The status of the NilHook.
 * @property data - The data of the NilHook.
 * @property isLoading - Whether the NilHook is loading.
 * @property isSuccess - Whether the NilHook is successful.
 * @property isError - Whether the NilHook has an error.
 * @property isIdle - Whether the NilHook is idle.
 */
export interface NilHookSuccessResult<R> {
  status: "success";
  data: R;
  isLoading: false;
  isSuccess: true;
  isError: false;
  isIdle: false;
}

/**
 * NilHookErrorResult is a set of states that a NilHook can be in when it has an error.
 * @property status - The status of the NilHook.
 * @property error - The error of the NilHook.
 * @property isLoading - Whether the NilHook is loading.
 * @property isSuccess - Whether the NilHook is successful.
 * @property isError - Whether the NilHook has an error.
 * @property isIdle - Whether the NilHook is idle.
 */
export interface NilHookErrorResult {
  status: "error";
  error: Error;
  isLoading: false;
  isSuccess: false;
  isError: true;
  isIdle: false;
}

/**
 * nilHookBaseResult is a function that returns the state of a NilHook.
 * @param mutate - The result of a mutation.
 * @returns The state of the NilHook, which can be idle, loading, success, or error.
 */
export const nilHookBaseResult = <T, E, R>(
  mutate: UseMutationResult<T, E, R>,
) => {
  if (mutate.isPending) {
    return {
      ...NilHookState.Loading,
    };
  }

  if (mutate.isSuccess) {
    return {
      data: mutate.data,
      ...NilHookState.Success,
    };
  }

  if (mutate.isError) {
    return {
      error: mutate.error,
      ...NilHookState.Error,
    };
  }

  return {
    ...NilHookState.Idle,
  };
};
