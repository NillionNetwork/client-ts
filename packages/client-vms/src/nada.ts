import {
  isObjectLiteral,
  NadaPrimitiveValue,
  NadaValue,
  NadaValues,
  NamedValue,
} from "@nillion/client-core";
import { StoreValueArgs } from "./types";
import { Effect as E } from "effect";

export const valuesRecordToNadaValues = (
  values: Record<NamedValue | string, NadaPrimitiveValue | StoreValueArgs>,
) =>
  E.try(() => {
    const nadaValues = NadaValues.create();
    for (const [key, value] of Object.entries(values)) {
      const name = NamedValue.parse(key);
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
