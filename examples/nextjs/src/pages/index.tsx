import * as React from "react";
import { useFetchValue, useStoreValue } from "@nillion/client-react-hooks";
import { useState } from "react";

export default function Home() {
  const [id, setId] = useState("");
  const storeValue = useStoreValue();
  const fetchValue = useFetchValue(
    {
      id,
      name: "foo",
      type: "SecretInteger",
    },
    {
      staleTime: 1000 * 30, // data stale after 30 seconds
    },
  );

  const data = {
    foo: 42,
  };

  if (storeValue.data && !id) {
    setId(storeValue.data);
  }

  const handleStoreClick = () => {
    storeValue.mutate({
      values: data,
      ttl: 1,
    });
  };

  const handleFetchClick = async () => {
    await fetchValue.refetch();
  };

  return (
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
        <li>
          Updated at: {new Date(fetchValue.dataUpdatedAt).toLocaleString()}
        </li>
        <li>
          From cache:{" "}
          {Boolean(
            fetchValue.isFetched && !fetchValue.isFetchedAfterMount,
          ).toString()}
        </li>
        {fetchValue.data && <li>Data: {JSON.stringify(fetchValue.data)}</li>}
      </ul>
    </div>
  );
}
