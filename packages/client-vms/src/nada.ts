import { Effect as E } from "effect";

import {
  isObjectLiteral,
  NadaPrimitiveValue,
  NadaValue,
  NadaValues,
  NamedValue,
} from "@nillion/client-core";

import { StoreValueArgs } from "./types";

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
