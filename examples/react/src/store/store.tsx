import * as React from "react";
import { Box, Typography } from "@mui/joy";
import { CreateStore } from "./create-store";
import { ViewStore } from "./view-store";

export const Store = () => {
  return (
    <Box>
      <Box pb={2}>
        <Typography level={"h1"}>Storage</Typography>
        <Typography>
          Deadlights jack lad schooner scallywag dance the hempen jig carouser
          broadside cable strike colors. Bring a spring upon her cable holystone
          blow the man down spanker Shiver me timbers to go on account lookout
          wherry doubloon chase. Belay yo-ho-ho keelhaul squiffy black spot
          yardarm spyglass sheet transom heave to.
        </Typography>
      </Box>
      <ViewStore />
      <CreateStore />
    </Box>
  );
};
