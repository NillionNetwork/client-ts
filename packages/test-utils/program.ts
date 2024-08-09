export const loadProgram = async (name: string): Promise<Uint8Array> => {
  const path = `__resources__/programs/dist/${name}`;
  try {
    const response = await fetch(path);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return (await response.body!.getReader().read()).value!;
  } catch (e) {
    console.error("failed to load program: ", path);
    console.error("error: ", e);
    throw e;
  }
};
