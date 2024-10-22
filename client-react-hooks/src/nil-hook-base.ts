import { UseMutationResult } from "@tanstack/react-query";

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

export interface NilHookBaseResult<ExecuteArgs, ExecuteResult> {
  execute: (args: ExecuteArgs) => void;
  executeAsync: (args: ExecuteArgs) => Promise<ExecuteResult>;
}

export interface NilHookIdleResult {
  status: "idle";
  isLoading: false;
  isSuccess: false;
  isError: false;
  isIdle: true;
}

export interface NilHookLoadingResult {
  status: "loading";
  isLoading: true;
  isSuccess: false;
  isError: false;
  isIdle: false;
}

export interface NilHookSuccessResult<R> {
  status: "success";
  data: R;
  isLoading: false;
  isSuccess: true;
  isError: false;
  isIdle: false;
}

export interface NilHookErrorResult {
  status: "error";
  error: Error;
  isLoading: false;
  isSuccess: false;
  isError: true;
  isIdle: false;
}

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
