import { NadaValue, NadaValues, Operation } from "@nillion/client-wasm";
import React, { useEffect, useState } from "react";
import { pay } from "./chain";
import { useNillion } from "@nillion/react-hooks";
import { logger } from "./index";

type Step = {
  finished: boolean;
  message: string;
};

export function NilDemo() {
  const nillion = useNillion();

  const [steps, setSteps] = useState<Step[]>([
    { finished: true, message: "Hello 👋" },
  ]);

  function addStep(next: Step) {
    setSteps((prev) => [...prev, next]);
  }

  useEffect(() => {
    async function run() {
      logger("🚀 starting");
      const { client, config } = nillion;
      const secretName = "foo";
      const secretValue = "42";

      const values = new NadaValues();
      values.insert(
        secretName,
        NadaValue.new_public_unsigned_integer(secretValue),
      );
      addStep({
        finished: true,
        message: `Prepare value: ${secretName}=${secretValue}`,
      });

      let quote = await client.fetchQuote(Operation.store_values(values, 1));
      addStep({
        finished: true,
        message: `Storage fee: ${quote.cost.total}unil`,
      });

      let receipt = await pay(config, quote);
      addStep({
        finished: true,
        message: "Paid",
      });

      const storeId = await client.storeValues(values, receipt, undefined);
      addStep({
        finished: true,
        message: `Value commited with id: ${storeId}`,
      });

      addStep({
        finished: true,
        message: "Reconstructing value ...",
      });

      quote = await client.fetchQuote(Operation.retrieve_value());
      addStep({
        finished: true,
        message: `Retrieve fee is ${quote.cost.total}unil`,
      });

      receipt = await pay(config, quote);
      addStep({
        finished: true,
        message: "Paid",
      });

      const value = await client.retrieveValue(storeId, secretName, receipt);
      addStep({
        finished: true,
        message: `Retrieve and reconstructed value: ${value.to_integer()}`,
      });

      addStep({
        finished: true,
        message: `Demo finished`,
      });
    }

    void run();
  }, []);

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
