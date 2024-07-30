import { Breadcrumbs, Grid, Link } from "@mui/joy";
import * as React from "react";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";

export const Root = () => {
  const location = useLocation();
  const path = location.pathname;

  let crumbs = [
    <Link to="/" component={RouterLink}>
      Home
    </Link>,
  ];

  if (path.includes("/store"))
    crumbs.push(
      <Link key="/store" to="/store" component={RouterLink}>
        Store
      </Link>,
    );

  if (path.includes("/program"))
    crumbs.push(
      <Link key="/program" to="/program" component={RouterLink}>
        Program
      </Link>,
    );

  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      spacing={2}
      padding={2}
    >
      <Grid>
        <Breadcrumbs aria-label="breadcrumbs">{...crumbs}</Breadcrumbs>
      </Grid>
      <Grid>
        <Outlet />
      </Grid>
    </Grid>
  );
};
