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
  NadaValueType,
  NamedValue,
  Operation,
  OperationCost,
  StoreId,
} from "@nillion/client-core";

export const Home = () => {
  const nillion = useNillion();
  const [clusterInfo, setClusterInfo] = useState<ClusterDescriptor | Error>();
  const [quote, setQuote] = useState<OperationCost | Error>();

  const run = async () => {
    try {
      if (!nillion.ready) return;

      const clusterInfoResult = await nillion.client.fetchClusterInfo();
      clusterInfoResult.err
        ? setClusterInfo(clusterInfoResult.err)
        : setClusterInfo(clusterInfoResult.ok);

      const quoteResult = await nillion.client.fetchOperationQuote({
        operation: Operation.fetchValue({
          id: "foo" as StoreId,
          name: "bar" as NamedValue,
          type: NadaValueType.enum.IntegerSecret,
        }),
      });
      quoteResult.err
        ? setQuote(quoteResult.err)
        : setQuote(quoteResult.ok.cost);
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
        <ListItem>
          {clusterInfo ? (
            <>
              <ListItemDecorator>✅</ListItemDecorator>
              <ListItemContent>
                <Typography level="title-sm">Cluster info</Typography>
                <Typography level="body-sm" noWrap>
                  {JSON.stringify(clusterInfo)}
                </Typography>
              </ListItemContent>
            </>
          ) : (
            <>
              <ListItemDecorator>⏳</ListItemDecorator>
              Loading ...
            </>
          )}
        </ListItem>
        <ListItem>
          {quote ? (
            <>
              <ListItemDecorator>✅</ListItemDecorator>
              <ListItemContent>
                <Typography level="title-sm">Quote cost</Typography>
                <Typography level="body-sm" noWrap>
                  {JSON.stringify(quote)}
                </Typography>
              </ListItemContent>
            </>
          ) : (
            <>
              <ListItemDecorator>⏳</ListItemDecorator>
              Loading ...
            </>
          )}
        </ListItem>
      </List>
    </Box>
  );
};
