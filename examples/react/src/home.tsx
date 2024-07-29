import * as React from "react";
import {
  useDeleteValue,
  useFetchValue,
  useStoreValue,
  useUpdateValue,
} from "@nillion/client-react-hooks";
import { Box, Button, Divider, List, ListItem, Typography } from "@mui/joy";
import { NadaValueType } from "@nillion/client-core";
import { useState } from "react";

export const Home = () => {
  const original = { foo: 42 };
  const [id, setId] = useState<string | null>(null);
  const store = useStoreValue();
  const fetch = useFetchValue(
    {
      id,
      name: "foo",
      type: NadaValueType.enum.IntegerSecret,
    },
    {
      enabled: false,
    },
  );
  const update = useUpdateValue();
  const drop = useDeleteValue();

  const handleStoreClick = () => {
    store.mutate({
      values: original,
      ttl: 1,
    });
  };

  const handleFetchClick = () => {
    void fetch.refetch();
  };

  const handleUpdateClick = () => {
    update.mutate({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      id: id!,
      values: {
        foo: 77,
      },
      ttl: 2,
    });
  };

  const handleDropClick = () => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    drop.mutate(id!);
  };

  if (store.isSuccess && !id) {
    setId(store.data);
  }

  return (
    <Box>
      <Box>
        <Typography level={"h2"}>Store</Typography>
        <Button onClick={handleStoreClick}>Store</Button>
        <Typography>Data: "{JSON.stringify(original)}"</Typography>
        <List>
          <ListItem>ℹ️ Store status: {store.status}</ListItem>
          <ListItem>➡️ Store id: {store.data}</ListItem>
          {store.isError && (
            <ListItem>🤕{JSON.stringify(store.error)}</ListItem>
          )}
        </List>
      </Box>
      <Divider />
      <Box>
        <Typography level={"h2"}>Fetch</Typography>
        <Button onClick={handleFetchClick}>Refresh</Button>
        <List>
          <ListItem>ℹ️ Status: {fetch.status}</ListItem>
          <ListItem>
            ℹ️ Last updated: {new Date(fetch.dataUpdatedAt).toLocaleString()}
          </ListItem>
          <ListItem>
            ℹ️ From cache:{" "}
            {Boolean(fetch.isFetched && !fetch.isFetchedAfterMount).toString()}
          </ListItem>
          {fetch.isSuccess && (
            <ListItem>🔁 Fetched: {JSON.stringify(fetch.data)}</ListItem>
          )}
          {fetch.isError && (
            <ListItem>🤕{JSON.stringify(fetch.error)}</ListItem>
          )}
        </List>
      </Box>
      <Divider />
      <Box>
        <Typography level={"h2"}>Update</Typography>
        <Button onClick={handleUpdateClick}>Update</Button>
        <List>
          <ListItem>ℹ️ Status: {update.status}</ListItem>
          <ListItem>
            ℹ️ Last updated: {new Date(update.submittedAt).toLocaleString()}
          </ListItem>
          {update.isSuccess && (
            <ListItem>🔁 Action id: {JSON.stringify(update.data)}</ListItem>
          )}
          {update.isError && (
            <ListItem>🤕{JSON.stringify(update.error)}</ListItem>
          )}
        </List>
      </Box>
      <Divider />
      <Box>
        <Typography level={"h2"}>Delete</Typography>
        <Button onClick={handleDropClick}>Drop</Button>
        <List>
          <ListItem>ℹ️ Status: {drop.status}</ListItem>
          <ListItem>
            ℹ️ Submitted: {new Date(drop.submittedAt).toLocaleString()}
          </ListItem>
          {drop.isError && <ListItem>🤕{JSON.stringify(drop.error)}</ListItem>}
        </List>
      </Box>
    </Box>
  );
};
