import { Box, Button, Divider, List, ListItem, Typography } from "@mui/joy";
import { NadaValueType, Permissions } from "@nillion/client-core";
import {
  useDeleteValue,
  useFetchPermissions,
  useFetchValue,
  useNillion,
  useSetPermissions,
  useStoreValue,
  useUpdateValue,
} from "@nillion/client-react-hooks";
import * as React from "react";
import { useState } from "react";

export const Home = () => {
  const original = { foo: 42 };
  const nillion = useNillion();
  const [id, setId] = useState<string | null>(null);
  const store = useStoreValue();
  const fetch = useFetchValue({
    id,
    name: "foo",
    type: NadaValueType.enum.IntegerSecret,
  });
  const update = useUpdateValue();
  const fetchPermissions = useFetchPermissions({ id });
  const setPermissions = useSetPermissions();
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
      id: id!,
      values: {
        foo: 77,
      },
      ttl: 2,
    });
  };

  const handleFetchPermissionsClick = () => {
    fetchPermissions.refetch();
  };

  const handleSetPermissionsClick = () => {
    setPermissions.mutate({
      id: id!,
      permissions: Permissions.createDefaultForUser(nillion.vm.userId),
    });
  };

  const handleDropClick = () => {
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
        <Typography level={"h2"}>Fetch permissions</Typography>
        <Button onClick={handleFetchPermissionsClick}>Refetch</Button>
        <List>
          <ListItem>ℹ️ Status: {fetchPermissions.status}</ListItem>
          <ListItem>
            ℹ️ Last updated:{" "}
            {new Date(fetchPermissions.dataUpdatedAt).toLocaleString()}
          </ListItem>
          <ListItem>
            ℹ️ From cache:{" "}
            {Boolean(
              fetchPermissions.isFetched &&
                !fetchPermissions.isFetchedAfterMount,
            ).toString()}
          </ListItem>
          {fetchPermissions.isSuccess && (
            <ListItem>
              🔁 Action id: {JSON.stringify(fetchPermissions.data)}
            </ListItem>
          )}
          {fetchPermissions.isError && (
            <ListItem>🤕{JSON.stringify(fetchPermissions.error)}</ListItem>
          )}
        </List>
      </Box>
      <Divider />
      <Box>
        <Typography level={"h2"}>Set permissions</Typography>
        <Button onClick={handleSetPermissionsClick}>Set</Button>
        <List>
          <ListItem>ℹ️ Status: {setPermissions.status}</ListItem>
          <ListItem>
            ℹ️ Last updated:{" "}
            {new Date(setPermissions.submittedAt).toLocaleString()}
          </ListItem>
          {setPermissions.isSuccess && (
            <ListItem>
              🔁 Action id: {JSON.stringify(setPermissions.data)}
            </ListItem>
          )}
          {setPermissions.isError && (
            <ListItem>🤕{JSON.stringify(setPermissions.error)}</ListItem>
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
