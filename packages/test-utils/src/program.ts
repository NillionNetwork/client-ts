export const loadProgram = async (name: string): Promise<Uint8Array> => {
  const path = `__resources__/programs/dist/${name}`;
  try {
    const response = await fetch(path);
    const body = (await response.body?.getReader().read())?.value;
    if (body) return body;
    throw new Error(`Could not find program for ${name}`);
  } catch (e) {
    console.error("failed to load program: ", path);
    console.error("error: ", e);
    throw e;
  }
};
