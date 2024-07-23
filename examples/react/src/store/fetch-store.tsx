import * as React from "react";
import { Box, Input, Typography, Button, Stack } from "@mui/joy";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StoreId } from "@nillion/core";
import { CreateStore } from "./create-store";

export const Store = () => {
  const [id, setId] = useState("");
  const navigate = useNavigate();
  const isValidId = !StoreId.safeParse(id).success;

  const handleFetch = () => {
    navigate(`/stores/${id}`);
  };

  return (
    <Stack spacing={2}>
      <Typography level={"h2"}>Fetch store</Typography>
      <Input
        placeholder={"Store id..."}
        onChange={(e) => setId(e.target.value)}
        value={id}
      />
      <Input
        placeholder={"Value name"}
        onChange={(e) => setId(e.target.value)}
        value={id}
      />
      <Button onClick={handleFetch} disabled={isValidId}>
        Fetch data
      </Button>
    </Stack>
  );
};
