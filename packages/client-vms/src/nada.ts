import { Effect as E } from "effect";

import {
  isObjectLiteral,
  NadaPrimitiveValue,
  NadaValue,
  NadaValues,
  NamedValue,
} from "@nillion/client-core";

import { StoreValueArgs } from "./types";

/**
 * `toNadaValues` is a function that takes a `NamedValue` or `string` and a `NadaPrimitiveValue` or `StoreValueArgs` and returns a `NadaValues` object.
 * @param args: {@link toNadaValuesArgs}
 * @returns {@link NadaValues}
 * @throws
 * @example
 * ```ts
 * const nadaValues = toNadaValues({
 *   name: "myValue",
 *   value: "myValueData",
 * });
 * ```
 */
export const toNadaValues = (args: {
  name: NamedValue | string;
  value: NadaPrimitiveValue | StoreValueArgs;
}) =>
  E.try(() => {
    const nadaValues = NadaValues.create();
    const name = NamedValue.parse(args.name, {
      path: ["toNadaValues", "NamedValue"],
    });
    const nadaValueArgs = isObjectLiteral(args.value)
      ? (args.value as StoreValueArgs)
      : {
          secret: true,
          data: args.value,
        };
    const nadaValue = NadaValue.fromPrimitive(nadaValueArgs);
    nadaValues.insert(name, nadaValue);
    return nadaValues;
  });
