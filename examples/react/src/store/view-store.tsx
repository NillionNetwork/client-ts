import * as React from "react";
import { useParams } from "react-router-dom";

export const ViewStore = () => {
  const { id } = useParams();

  return (
    <div style={{ padding: "10px" }}>
      <h1>View store: {id ?? "unset"}</h1>
    </div>
  );
};
