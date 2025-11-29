import { isInstalled } from "./isInstalled";

const runtimeList = [
  { value: "bun", cmd: "bun", label: "Bun" },
  { value: "node", cmd: "node", label: "Node.js" },
  { value: "deno", cmd: "deno", label: "Deno" },
] as const;

export async function getAvailableRuntimes() {
  const checks = await Promise.all(
    runtimeList.map(async (rt) => ({
      ...rt,
      available: await isInstalled(rt.cmd),
    }))
  );

  return checks
    .filter((x) => x.available)
    .map((x) => ({
      value: x.value,
      label: x.label,
    }));
}
