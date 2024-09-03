"use client";

import { type FC, useState } from "react";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { createSignerFromKey } from "@nillion/client-payments";
import { useNillionAuth, UserCredentials } from "@nillion/client-react-hooks";

export const Login: FC = () => {
  const { authenticated, login, logout } = useNillionAuth();

  const [useKeplr, setUseKeplr] = useState(false);
  const [seed, setUserSeed] = useState("example-secret-seed");
  const [secretKey, setSecretKey] = useState(
    "9a975f567428d054f2bf3092812e6c42f901ce07d9711bc77ee2cd81101f42c5",
  );
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleToggle = () => {
    setUseKeplr(!useKeplr);
  };

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      const credentials: UserCredentials = {
        userSeed: seed,
      };
      if (!useKeplr) {
        credentials.signer = () => createSignerFromKey(secretKey);
      }
      await login(credentials);
      setIsLoggingIn(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setIsLoggingOut(false);
    } catch (err) {
      console.error(err);
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
      <Typography variant="h5" gutterBottom>
        Login
      </Typography>
      <Typography variant="body2">
        You must login before using the client.
      </Typography>
      <Box sx={{ mb: 4 }} />
      <TextField
        required
        fullWidth
        margin="normal"
        name="seed"
        label="User seed"
        autoFocus
        value={seed}
        onChange={(e) => {
          setUserSeed(e.target.value);
        }}
      />
      <FormControlLabel
        control={
          <Switch
            checked={useKeplr}
            onChange={handleToggle}
            name="useKeplr"
            color="primary"
          />
        }
        label="Use Keplr Wallet"
      />
      {!useKeplr && (
        <TextField
          required
          fullWidth
          margin="normal"
          name="secretKey"
          label="Wallet secret key"
          type="password"
          value={secretKey}
          onChange={(e) => {
            setSecretKey(e.target.value);
          }}
        />
      )}
      <Box sx={{ mt: 2, display: "flex" }}>
        <LoadingButton
          variant="outlined"
          sx={{ mr: 4, width: "150px" }}
          loading={isLoggingIn}
          disabled={authenticated}
          onClick={() => void handleLogin()}
        >
          Log in
        </LoadingButton>
        <LoadingButton
          variant="outlined"
          sx={{ width: "150px" }}
          loading={isLoggingOut}
          disabled={!authenticated}
          onClick={() => void handleLogout()}
        >
          Logout
        </LoadingButton>
      </Box>
    </Box>
  );
};
