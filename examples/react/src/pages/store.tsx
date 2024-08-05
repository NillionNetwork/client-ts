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

export const Store = () => {
  const data = "Hi, I'm SecretString nice to meet you :)";
  const nillion = useNillion();
  const [id, setId] = useState<string | null>(null);
  const storeValue = useStoreValue();
  const fetchValue = useFetchValue<string>({
    id,
    name: "data",
    type: NadaValueType.enum.SecretString,
  });
  const update = useUpdateValue();
  const fetchPermissions = useFetchPermissions({ id });
  const setPermissions = useSetPermissions();
  const drop = useDeleteValue();

  const handleStoreClick = () => {
    storeValue.mutate({
      values: {
        data,
      },
      ttl: 1,
    });
  };

  const handleFetchClick = () => {
    void fetchValue.refetch();
  };

  const handleUpdateClick = () => {
    update.mutate({
      id: id!,
      values: {
        data: "I'm an updated SecretString :)",
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

  if (storeValue.isSuccess && !id) {
    setId(storeValue.data);
  }

  return (
    <Box>
      <Box>
        <Typography level={"h2"}>Store</Typography>
        <Button onClick={handleStoreClick} sx={{ my: 1 }}>
          Store
        </Button>
        <List>
          <ListItem>ℹ️ Data: "{data}"</ListItem>
          <ListItem>ℹ️ Store status: {storeValue.status}</ListItem>
          <ListItem>➡️ Store id: {storeValue.data}</ListItem>
          {storeValue.isError && (
            <ListItem>🤕{JSON.stringify(storeValue.error)}</ListItem>
          )}
        </List>
      </Box>
      <Divider />
      <Box>
        <Typography level={"h2"}>Fetch</Typography>
        <Button onClick={handleFetchClick} sx={{ my: 1 }}>
          Refresh
        </Button>
        <List>
          <ListItem>ℹ️ Status: {fetchValue.status}</ListItem>
          <ListItem>
            ℹ️ Last updated:{" "}
            {new Date(fetchValue.dataUpdatedAt).toLocaleString()}
          </ListItem>
          <ListItem>
            ℹ️ From cache:{" "}
            {Boolean(
              fetchValue.isFetched && !fetchValue.isFetchedAfterMount,
            ).toString()}
          </ListItem>
          {fetchValue.isSuccess && (
            <ListItem>🔁 Fetched: {JSON.stringify(fetchValue.data)}</ListItem>
          )}
          {fetchValue.isError && (
            <ListItem>🤕{JSON.stringify(fetchValue.error)}</ListItem>
          )}
        </List>
      </Box>
      <Divider />
      <Box>
        <Typography level={"h2"}>Fetch permissions</Typography>
        <Button onClick={handleFetchPermissionsClick} sx={{ my: 1 }}>
          Refetch
        </Button>
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
        <Button onClick={handleSetPermissionsClick} sx={{ my: 1 }}>
          Set
        </Button>
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
