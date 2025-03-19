"use client";

import {
  ClientBuilder,
  NillionProvider,
  getKeplr,
} from "@nillion/client-react-hooks";
import type { VmClient } from "@nillion/client-vms";
import { useEffect, useState } from "react";
import { AccountBalance } from "#/components/account-balance";
import { AddFunds } from "#/components/add-funds";
import { DeleteValues } from "#/components/delete-values";
import { EcdsaSign } from "#/components/ecdsa-sign";
import { InvokeCompute } from "#/components/invoke-compute";
import { OverwritePermissions } from "#/components/overwrite-permissions";
import { PoolStatus } from "#/components/pool-status";
import { RetrieveComputeResults } from "#/components/retrieve-compute-results";
import { RetrievePermissions } from "#/components/retrieve-permissions";
import { RetrieveValues } from "#/components/retrieve-values";
import { StoreSignatureValues } from "#/components/store-ecdsa-values";
import { StoreProgram } from "#/components/store-program";
import { StoreValues } from "#/components/store-values";
import { UpdateEcdsaPermissions } from "#/components/update-ecdsa-permissions";
import { UpdatePermissions } from "#/components/update-permissions";
import { UpdateValues } from "#/components/update-values";

export default function Home() {
  const [client, setClient] = useState<VmClient>();

  useEffect(() => {
    const init = async () => {
      const client = await ClientBuilder.testnet(
        "foobarbaz",
        await getKeplr(),
      ).build();
      setClient(client);
    };
    void init();
  }, []);

  if (!client) {
    return <div>Loading...</div>;
  }

  return (
    <NillionProvider client={client}>
      <PoolStatus />
      <AccountBalance />
      <AddFunds />
      <StoreValues />
      <RetrieveValues />
      <UpdateValues />
      <DeleteValues />
      <RetrievePermissions />
      <UpdatePermissions />
      <OverwritePermissions />
      <StoreProgram />
      <InvokeCompute />
      <RetrieveComputeResults />
      <StoreSignatureValues />
      <UpdateEcdsaPermissions />
      <EcdsaSign />
    </NillionProvider>
  );
}
