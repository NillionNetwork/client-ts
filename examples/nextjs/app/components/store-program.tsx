"use client";

import { type FC, useState, useRef } from "react";
import { Save as SaveIcon, UploadFile as FileIcon } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import { Box, TextField, Typography } from "@mui/material";

import { useNilStoreProgram } from "@nillion/client-react-hooks";

export const StoreProgram: FC = () => {
  const nilStoreProgram = useNilStoreProgram();
  const [name, setName] = useState<string>("");
  const [program, setProgram] = useState<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = () => {
    if (!name || !program)
      throw new Error("store-program: Name and program data required");
    nilStoreProgram.execute({ name, program });
  };

  const handleOpen = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        if (content) {
          setProgram(new Uint8Array(content as ArrayBuffer));
        }
      };
      reader.readAsArrayBuffer(file);
    }
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
      <Typography variant="h5">Store Program</Typography>
      <Box sx={{ mb: 4 }} />
      <TextField
        fullWidth
        label="Program name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
        }}
      />
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <LoadingButton
        variant="outlined"
        sx={{ width: "150px", mt: 4 }}
        startIcon={<FileIcon />}
        loading={nilStoreProgram.isLoading}
        onClick={handleOpen}
        disabled={nilStoreProgram.isLoading}
      >
        Open File
      </LoadingButton>
      <LoadingButton
        variant="outlined"
        sx={{ ml: 4, width: "150px", mt: 4 }}
        startIcon={<SaveIcon />}
        loading={nilStoreProgram.isLoading}
        onClick={handleSave}
        disabled={!name || !program || nilStoreProgram.isLoading}
      >
        Store
      </LoadingButton>
      <ul>
        <li>
          <Typography sx={{ mt: 2 }}>
            Status: {nilStoreProgram.status}
          </Typography>
        </li>
        <li>
          <Typography sx={{ mt: 2 }}>
            File name: {fileName ? fileName : "unset"}
          </Typography>
        </li>
        <li>
          <Typography sx={{ mt: 2 }}>
            Program id:{" "}
            {nilStoreProgram.isSuccess ? nilStoreProgram.data : "idle"}
          </Typography>
        </li>
      </ul>
    </Box>
  );
};
