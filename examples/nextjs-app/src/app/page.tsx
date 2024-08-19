"use client";
import * as React from "react";
import {
  useFetchValue,
  useNillion,
  useStoreValue,
} from "@nillion/client-react-hooks";
import { useState } from "react";

export default function Home() {
  const [id, setId] = useState("");
  const storeValue = useStoreValue();

  const client = useNillion();
  console.log("clientNillion", client);
  console.log("storeValue", storeValue);

  const fetchValue = useFetchValue(
    {
      id,
      name: "data",
      type: "SecretInteger",
    },
    {
      staleTime: 1000 * 30, // data stale after 30 seconds
    },
  );

  const data = 42;

  if (storeValue.data && !id) {
    setId(storeValue.data);
  }

  const handleStoreClick = () => {
    storeValue.mutate({
      values: { data },
      ttl: 1,
    });
  };

  const handleFetchClick = async () => {
    await fetchValue.refetch();
  };

  const updatedAtTs =
    fetchValue.dataUpdatedAt === 0
      ? ""
      : new Date(fetchValue.dataUpdatedAt).toLocaleString("en-GB", {
          timeZone: "UTC",
        });

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h2>Hello from @nillion/client-* 👋</h2>
        <p>Original data: {JSON.stringify(data)}</p>
        <p>1. Store data</p>
        <button onClick={handleStoreClick} disabled={storeValue.isPending}>
          Store
        </button>
        <ul>
          <li>Status: {storeValue.status}</li>
          {id && <li>Id: {id}</li>}
        </ul>
        <p>2. Read data</p>
        <button
          onClick={handleFetchClick}
          disabled={!Boolean(id) || fetchValue.isPending}
        >
          Force refresh
        </button>
        <ul>
          <li>Status: {fetchValue.status}</li>
          <li>Updated at: {updatedAtTs}</li>
          <li>
            From cache:{" "}
            {Boolean(
              fetchValue.isFetched && !fetchValue.isFetchedAfterMount,
            ).toString()}
          </li>
          {fetchValue.data && <li>Data: {JSON.stringify(fetchValue.data)}</li>}
        </ul>
      </div>
    </main>
  );
}
