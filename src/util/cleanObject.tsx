export function cleanObject(obj: Record<string, any>) {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => v !== undefined),
  );
}
