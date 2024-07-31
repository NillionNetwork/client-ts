export const isMap = <T, U>(value: unknown): value is Map<T, U> => {
  return isDefinedAndNotNull(value) && value instanceof Map;
};

export const isObjectLiteral = (value: unknown): value is object => {
  return isDefinedAndNotNull(value) && value?.constructor === Object;
};

export const isUint8Array = (value: unknown): value is Uint8Array => {
  return isDefinedAndNotNull(value) && value instanceof Uint8Array;
};

export const isBigInt = (value: unknown): value is bigint => {
  return isDefinedAndNotNull(value) && typeof value === "bigint";
};

export const isNumber = (value: unknown): value is number => {
  return isDefinedAndNotNull(value) && typeof value === "number";
};

export const isBoolean = (value: unknown): value is boolean => {
  return isDefinedAndNotNull(value) && typeof value === "boolean";
};

export const isString = (value: unknown): value is string => {
  return isDefinedAndNotNull(value) && typeof value === "string";
};

export const isNull = (value: unknown): value is null => {
  return value === null;
};

export const isUndefined = (value: unknown): value is undefined => {
  return value === undefined;
};

export const isDefinedAndNotNull = <T>(
  value: T | undefined | null,
): value is T => {
  return value !== undefined && value !== null;
};
