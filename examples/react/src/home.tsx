import * as React from "react";
import { useNillion } from "@nillion/client-react-hooks";
import { useEffect, useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemContent,
  ListItemDecorator,
  Typography,
} from "@mui/joy";
import {
  ClusterDescriptor,
  StoreId,
  Result,
  NadaValueType,
  NadaPrimitiveValue,
} from "@nillion/client-core";

export const Home = () => {
  const nillion = useNillion();

  const [cluster, setCluster] = useState<Result<ClusterDescriptor, Error>>();

  const [intStoreId, setIntStoreId] = useState<Result<StoreId, Error>>();
  const [uintStoreId, setUintStoreId] = useState<Result<StoreId, Error>>();

  const [int, setInt] =
    useState<Result<Record<string, NadaPrimitiveValue>, Error>>();
  const [uint, setUint] =
    useState<Result<Record<string, NadaPrimitiveValue>, Error>>();

  const run = async () => {
    try {
      if (!nillion.ready) return;
      const { client } = nillion;

      const clusterResult = await client.fetchClusterInfo();
      setCluster(clusterResult);

      const intStoreIdResult = await client.store({ int: -42 }, { ttl: 1 });
      setIntStoreId(intStoreIdResult);

      const intResult = await client.fetch(intStoreIdResult.ok!, [
        ["int", NadaValueType.enum.IntegerSecret],
      ]);
      setInt(intResult);

      const uintStoreId = await client.store({ uint: 42n }, { ttl: 1 });
      setUintStoreId(uintStoreId);

      const uintResult = await client.fetch(uintStoreId.ok!, [
        ["uint", NadaValueType.enum.IntegerSecretUnsigned],
      ]);
      setUint(uintResult);
    } catch (e) {
      console.error("Promise error");
      console.error(e);
    }
  };

  useEffect(() => {
    void run();
  }, [nillion.ready]);

  if (!nillion.ready) {
    return (
      <Box>
        <Typography level={"h1"}>Welcome</Typography>
        <Typography>Nillion client not ready</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography level={"h1"}>Welcome</Typography>
      <List>
        <Item text={"Cluster info"} data={cluster} />
        <Item text={"Secret int store id"} data={intStoreId} />
        <Item text={"Secret int retrieved value"} data={int} />
        <Item text={"Secret uint store id"} data={uintStoreId} />
        <Item text={"Secret uint retrieved value"} data={uint} />
      </List>
    </Box>
  );
};

const Item = ({ text, data }: { text: string; data: unknown }) => {
  if (!Boolean(data)) {
    return (
      <ListItem>
        <ListItemDecorator>⏳</ListItemDecorator>
        <ListItemContent>
          <Typography level="title-sm">{text}</Typography>
          <Typography level="body-sm" noWrap>
            Loading ...
          </Typography>
        </ListItemContent>
      </ListItem>
    );
  }

  // @ts-ignore
  let value: unknown = data.ok;
  const stringified = JSON.stringify(value, (_key, value) =>
    typeof value === "bigint" ? value.toString() + "n" : value,
  );

  return (
    <ListItem>
      <ListItemDecorator>✅</ListItemDecorator>
      <ListItemContent>
        <Typography level="title-sm">{text}</Typography>
        <Typography level="body-sm" noWrap>
          {stringified}
        </Typography>
      </ListItemContent>
    </ListItem>
  );
};
