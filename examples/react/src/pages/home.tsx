import * as React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Link, List, ListItem } from "@mui/joy";

export const Home = () => {
  return (
    <Box>
      <List marker="circle">
        <ListItem>
          <Link color="neutral" to="/store" component={RouterLink}>
            Store hooks
          </Link>
        </ListItem>
        <ListItem>
          <Link color="neutral" to="/program" component={RouterLink}>
            Program hooks
          </Link>
        </ListItem>
      </List>
    </Box>
  );
};
