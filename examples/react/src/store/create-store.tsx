import * as React from "react";
import { Input, Sheet, Stack, Table } from "@mui/joy";
import { useState } from "react";
import { NamedValue } from "../../../../packages/client-core";

export const CreateStore: React.FC = () => {
  const [name, setName] = useState("");
  const validNameParseResult = NamedValue.safeParse(name);

  return (
    <Stack spacing={2}>
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={"Data store name"}
      />
      <Sheet>
        <Table color="neutral" size="md" stripe="even" variant="outlined">
          <thead>
            <tr>
              <th>Type</th>
              <th>Secret</th>
              <th style={{ width: "60%" }}>Value</th>
              <th>Controls</th>
            </tr>
          </thead>
          <tr></tr>
        </Table>
      </Sheet>
    </Stack>
  );
};
