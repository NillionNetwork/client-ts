export const collapse = <T>(list: T[]): T | never => {
  if (list.length === 0) {
    throw new Error("Cannot collapse empty list");
  }

  return list.reduce((acc, cur) => {
    if (acc === undefined) return cur;
    // TODO: serialized to account for objects but could be improved
    if (JSON.stringify(acc) !== JSON.stringify(cur))
      throw new Error(`Element mismatch: ${JSON.stringify(list)}`);
    return cur;
  });
};
