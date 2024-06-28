import { NadaValue, NadaValues, Operation } from "@nillion/client-wasm";
import React, { useEffect, useState } from "react";
import { pay } from "./utils";
import { useNillion } from "@nillion/react-hooks";

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
      console.log("🚀 starting");
      const { client, config } = nillion;
      const secretName = "foo";
      const secretValue = "42";

      const values = new NadaValues();
      values.insert(
        secretName,
        NadaValue.new_public_unsigned_integer(secretValue),
      );
      const storeOperation = Operation.store_values(values, 1);
      addStep({
        finished: true,
        message: `Prepare secret value: ${secretName}=${secretValue}`,
      });

      const quote = await client.fetchQuote(storeOperation);
      addStep({
        finished: true,
        message: `Store value fee is ${quote.cost.total}unil`,
      });

      const _storeReceipt = await pay(config, quote);
      addStep({
        finished: true,
        message: "Paid",
      });

      // const storeId = await client.store_values(
      //   clusterId,
      //   values,
      //   undefined,
      //   storeReceipt,
      // );
      // addStep({
      //   finished: true,
      //   message: "Secret value shredded and commited to the network",
      // });
      //
      // addStep({
      //   finished: true,
      //   message: "Now lets reconstruct the value ...",
      // });
      // const retrieveOperation = Operation.retrieve_value();
      // const retrieveQuote = await client.request_price_quote(
      //   clusterId,
      //   retrieveOperation,
      // );
      // addStep({
      //   finished: true,
      //   message: `Retrieve value fee is ${retrieveQuote.cost.total}unil`,
      // });
      //
      // const retrieveReceipt = await pay(
      //   client,
      //   clusterId,
      //   chainClient,
      //   chainWallet,
      //   retrieveOperation,
      // );
      // addStep({
      //   finished: true,
      //   message: "Paid",
      // });
      //
      // const value = await client.retrieve_value(
      //   clusterId,
      //   storeId,
      //   secretName,
      //   retrieveReceipt,
      // );
      // addStep({
      //   finished: true,
      //   message: `Retrieve and reconstructed value: ${value.to_integer()}`,
      // });
      // addStep({
      //   finished: true,
      //   message: `Demo finished`,
      // });
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
