"use client";

import { useNilStoreProgram } from "@nillion/client-react-hooks";
import { type FC, useRef, useState } from "react";

export const StoreProgram: FC = () => {
  const mutation = useNilStoreProgram();
  const [name, setName] = useState("");
  const [program, setProgram] = useState<Uint8Array | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setName(file.name);
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

  let id = "";
  if (mutation.isSuccess) {
    id = mutation.data;
  } else if (mutation.isError) {
    id = mutation.error.message;
  }

  const programDefined = name && program;

  return (
    <div>
      <h2>Store Program</h2>
      <ol>
        <li>Status: {mutation.status}</li>
        <li>Name: {name}</li>
        <li>Program Id: {id}</li>
      </ol>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} />

      <button
        type="button"
        disabled={!programDefined}
        onClick={(): void =>
          mutation.execute({
            name,
            program: program!,
          })
        }
      >
        Execute
      </button>
    </div>
  );
};
