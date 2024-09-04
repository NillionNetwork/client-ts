"use client";

import { type FC, useState } from "react";
import { Memory as ComputeIcon } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, TextField, Typography } from "@mui/material";

import {
  NadaValue,
  NadaValues,
  NamedValue,
  PartyName,
  ProgramBindings,
  ProgramId,
} from "@nillion/client-core";
import { useNilCompute, useNillion } from "@nillion/client-react-hooks";

export const Compute: FC = () => {
  const { client } = useNillion();
  const nilCompute = useNilCompute();
  const [programId, setProgramId] = useState<ProgramId | string>("");

  const handleClick = () => {
    if (!programId) throw new Error("compute: program id required");

    const bindings = ProgramBindings.create(programId)
      .addInputParty(PartyName.parse("Party1"), client.partyId)
      .addOutputParty(PartyName.parse("Party1"), client.partyId);

    const values = NadaValues.create()
      .insert(NamedValue.parse("A"), NadaValue.createSecretInteger(2))
      .insert(NamedValue.parse("B"), NadaValue.createSecretInteger(4));

    nilCompute.execute({ bindings, values });
  };

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "grey.400",
        borderRadius: 2,
        p: 2,
      }}
    >
      <Typography variant="h5">Compute</Typography>
      <Typography variant="body2">
        Please check this components implementation which executes
        addition_division.py.
      </Typography>
      <Box sx={{ mb: 4 }} />
      <TextField
        fullWidth
        label="Program id"
        value={programId}
        onChange={(e) => {
          setProgramId(e.target.value);
        }}
      />
      <LoadingButton
        variant="outlined"
        sx={{ width: "150px", mt: 4 }}
        startIcon={<ComputeIcon />}
        loading={nilCompute.isLoading}
        onClick={handleClick}
        disabled={nilCompute.isLoading}
      >
        Compute
      </LoadingButton>
      <ul>
        <li>
          <Typography sx={{ mt: 2 }}>Status: {nilCompute.status}</Typography>
        </li>
        <li>
          <Typography sx={{ mt: 2 }}>
            Compute output id: {nilCompute.isSuccess ? nilCompute.data : "idle"}
          </Typography>
        </li>
      </ul>
    </Box>
  );
};
