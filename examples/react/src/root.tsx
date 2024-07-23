import { Breadcrumbs, Grid, Link } from "@mui/joy";
import * as React from "react";
import { Outlet, Link as RouterLink } from "react-router-dom";

export const Root = () => {
  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
      spacing={2}
    >
      <Grid>
        <Breadcrumbs aria-label="breadcrumbs">
          <Link color="neutral" to="/" component={RouterLink}>
            Home
          </Link>
          <Link color="neutral" to="/stores" component={RouterLink}>
            Stores
          </Link>
        </Breadcrumbs>
      </Grid>
      <Grid>
        <Outlet />
      </Grid>
    </Grid>
  );
};
