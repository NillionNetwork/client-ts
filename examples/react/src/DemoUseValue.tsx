import React from "react";
import { useValue } from "@nillion/react-hooks";

export function DemoUseValue() {
  const { loading, error, id, data, store } = useValue();

  function handleSave() {
    store(42);
  }

  return (
    <div style={{ padding: "10px" }}>
      <h1>demo: useValue()</h1>
      <ol>
        <li>Loading: {String(loading)}</li>
        <li>Id: {id}</li>
        <li>Data: {JSON.stringify(data)}</li>
        <li>Error: {error?.message ?? "none"}</li>
      </ol>
      <div>
        <button onClick={(e) => handleSave()}>Save '42'!</button>
      </div>
    </div>
  );
}
