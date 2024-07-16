export const loadProgram = async (name: string): Promise<Uint8Array> => {
  const path = `__src__/${name}`;
  try {
    const response = await fetch(path);
    const body = response.body!;
    return (await body.getReader().read()).value!;
  } catch (e) {
    console.error(`failed to load program: ${path}`);
    console.error(`error: ${e}`);
    throw e;
  }
};
