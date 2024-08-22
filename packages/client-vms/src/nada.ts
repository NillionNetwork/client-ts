import {
  isObjectLiteral,
  NadaPrimitiveValue,
  NadaValue,
  NadaValues,
  NamedValue,
} from "@nillion/client-core";
import { Effect as E } from "effect";

import { StoreValueArgs } from "./types";

export const valuesRecordToNadaValues = (
  values: Record<NamedValue | string, NadaPrimitiveValue | StoreValueArgs>,
) =>
  E.try(() => {
    const nadaValues = NadaValues.create();
    for (const [key, value] of Object.entries(values)) {
      const name = NamedValue.parse(key, {
        path: ["valuesRecordToNadaValues", "NamedValue"],
      });
      const args = isObjectLiteral(value)
        ? (value as StoreValueArgs)
        : {
            secret: true,
            data: value,
          };

      const nadaValue = NadaValue.fromPrimitive(args);
      nadaValues.insert(name, nadaValue);
    }
    return nadaValues;
  });
