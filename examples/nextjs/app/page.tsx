"use client";

import { type FC } from "react";
import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";

const LoginLayout: FC = () => {
  const router = useRouter();

  const handleClick = () => {
    router.push("/home");
  };

  return (
    <Box sx={{ m: 4, display: "flex", flexDirection: "column" }}>
      <Typography variant="h4" gutterBottom>
        Welcome
      </Typography>
      <Button variant="outlined" onClick={handleClick}>
        Open Nillion Demo
      </Button>
    </Box>
  );
};

export default LoginLayout;
