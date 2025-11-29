export function normalizeProjectName(name: string) {
  return name.replace(/\s+/g, "").split("/").pop();
}
