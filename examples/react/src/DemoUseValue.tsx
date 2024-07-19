import React, { useState } from "react";
import { useValue } from "@nillion/react-hooks";

export function DemoUseValue() {
  const [value, setValue] = useState<number>();
  const { id, mutate, query } = useValue();

  const data = {
    foo: value,
  };

  return (
    <div style={{ padding: "10px" }}>
      <h1>demo: useValue()</h1>
      <h2>mutation</h2>
      <ol>
        <li>Status: {mutate.status}</li>
        <li>Id: {id}</li>
        <li>Local data: {JSON.stringify(data)}</li>
        <li>Error: {mutate.error?.message ?? "none"}</li>
      </ol>
      <h2>query</h2>
      <ol>
        <li>Status: {query.status}</li>
        <li>Last update: {query.dataUpdatedAt}</li>
        <li>Stale data: {String(query.isStale)}</li>
        <li>Id: {id}</li>
        <li>Fetched: {JSON.stringify(query.data ?? {})}</li>
        <li>Error: {query.error?.message ?? "none"}</li>
      </ol>
      <div>
        <input
          type={"number"}
          value={value ?? ""}
          onChange={(e) => setValue(Number(e.target.value))}
          placeholder={"Tell me your secret!"}
        />
      </div>
      <br />
      <div>
        <button onClick={(e) => mutate.mutate(value!)}>Save</button>
        <span> </span>
        <button onClick={(e) => query.refetch()}>Force refetch</button>
      </div>
    </div>
  );
}
