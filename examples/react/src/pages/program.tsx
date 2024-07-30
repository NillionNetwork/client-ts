import { Box, Button, Chip, Divider, Input, Stack, Typography } from "@mui/joy";
import {
  NadaValue,
  NadaValues,
  NamedValue,
  PartyName,
  ProgramBindings,
} from "@nillion/client-core";
import {
  useFetchProgramOutput,
  useNillion,
  useRunProgram,
  useStoreProgram,
} from "@nillion/client-react-hooks";
import * as React from "react";
import { useState } from "react";

export const Program = () => {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const nillion = useNillion();
  const [programId, setProgramId] = useState("");
  const [programOutputId, setProgramOutputId] = useState("");
  const storeProgram = useStoreProgram();
  const runProgram = useRunProgram();
  const fetchProgramOutput = useFetchProgramOutput({
    id: programOutputId,
  });

  const handleStoreProgram = async () => {
    const response = await fetch(
      "http://localhost:8080/addition_division.nada.bin",
    );
    const program = (await response.body!.getReader().read()).value!;
    storeProgram.mutate({
      name: "addition_division",
      program,
    });
  };

  const handleRunProgram = () => {
    const bindings = ProgramBindings.create(programId);
    bindings.addInputParty(PartyName.parse("Party1"), nillion.vm.partyId);
    bindings.addOutputParty(PartyName.parse("Party1"), nillion.vm.partyId);

    const values = NadaValues.create()
      .insert(
        NamedValue.parse("A"),
        NadaValue.fromPrimitive({ data: Number(a), secret: true }),
      )
      .insert(
        NamedValue.parse("B"),
        NadaValue.fromPrimitive({ data: Number(b), secret: true }),
      );

    runProgram.mutate({
      values,
      bindings,
      storeIds: [],
    });
  };

  if (storeProgram.data && !programId) {
    const id = storeProgram.data;
    console.log("Program id: ", id);
    setProgramId(id);
  }

  if (runProgram.data && !programOutputId) {
    setProgramOutputId(runProgram.data);
  }

  return (
    <Box sx={{ maxWidth: "600px" }}>
      <Typography level="h2" gutterBottom>
        Program hooks demo
      </Typography>
      <Divider sx={{ "--Divider-childPosition": "25px", my: 4 }}>
        <Chip variant="soft">Step 1: Store</Chip>
      </Divider>
      <Stack spacing={2}>
        <Button onClick={handleStoreProgram} sx={{ width: "200px" }}>
          Store
        </Button>
        {programId && (
          <>
            <Typography level="title-lg">Program Id</Typography>
            <Typography variant="outlined" color="success" noWrap>
              {programId}
            </Typography>
          </>
        )}
      </Stack>
      <Divider sx={{ "--Divider-childPosition": "25px", my: 4 }}>
        <Chip variant="soft">Step 2: Define input secrets</Chip>
      </Divider>
      <Input
        value={a}
        type="number"
        placeholder="Enter integer for argument 'A'"
        onChange={(e) => setA(e.target.value)}
        sx={{ my: 2, maxWidth: "400px" }}
      />
      <Input
        value={b}
        type="number"
        placeholder="Enter integer for argument 'B'"
        onChange={(e) => setB(e.target.value)}
        sx={{ my: 2, maxWidth: "400px" }}
      />
      <Divider sx={{ "--Divider-childPosition": "25px", my: 4 }}>
        <Chip variant="soft">Step 3: Run the program</Chip>
      </Divider>
      <Button onClick={handleRunProgram} sx={{ my: 2 }}>
        Run
      </Button>
      {programOutputId && (
        <>
          <Typography level="title-lg">Output Id</Typography>
          <Typography variant="outlined" color="success" noWrap>
            {programOutputId}
          </Typography>
        </>
      )}
      <Divider sx={{ "--Divider-childPosition": "25px", my: 4 }}>
        <Chip variant="soft">Step 4: Fetch the output</Chip>
      </Divider>
      <Typography level="title-lg">
        Status: {fetchProgramOutput.status}
      </Typography>
      {fetchProgramOutput.data && (
        <Typography variant="outlined" color="success" noWrap>
          {(fetchProgramOutput.data as unknown as Record<string, bigint>)[
            "my_output"
          ]?.toString() + "n"}
        </Typography>
      )}
    </Box>
  );
};
