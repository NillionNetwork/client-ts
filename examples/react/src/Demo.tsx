import React, { useEffect, useState } from "react";
import { useNillion } from "@nillion/react-hooks";
import { logger } from "./index";
import { ValueName, NadaValues, NadaValue } from "@nillion/client";

type Step = {
  finished: boolean;
  message: string;
};

export function Demo() {
  const nillion = useNillion();
  const { client, error, ready } = nillion;

  const [steps, setSteps] = useState<Step[]>([
    { finished: true, message: "Hello 👋" },
  ]);

  function addStep(next: Step) {
    setSteps((prev) => [...prev, next]);
  }

  useEffect(() => {
    if (!ready) {
      logger("waiting for nillion client to be ready ...");
      return;
    }

    async function run() {
      logger("Starting 🚀");
      const values = NadaValues.create().insert(
        ValueName.parse("foo"),
        NadaValue.createIntegerSecret(42),
      );
      const result = await client.storeValues({ values });
      if (result.err) {
        const { err } = result;
        console.error(err);
        addStep({ finished: true, message: "Failed " + err.message });
      } else {
        const { ok } = result;
        addStep({ finished: true, message: "Stored id = " + ok });
      }
    }

    void run();
  }, [ready]);

  if (!ready) {
    return (
      <div>
        <h1>Nillion react demo loading ...</h1>
      </div>
    );
  }

  return (
    <div>
      <h1>Nillion react demo</h1>
      {steps.map(({ finished, message }, key) => (
        <p key={key}>
          {finished ? "✅" : "🔁"} {message}
        </p>
      ))}
    </div>
  );
}
