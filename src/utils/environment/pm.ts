import { isInstalled } from "./isInstalled";

const packageManagers = [
	{ value: "npm", cmd: "npm" },
	{ value: "yarn", cmd: "yarn" },
	{ value: "pnpm", cmd: "pnpm" },
	{ value: "bun", cmd: "bun" },
	{ value: "deno", cmd: "deno" },
] as const;

export async function getAvailablePackageManagers(
	runtime: "node" | "bun" | "deno",
) {
	const supported =
		runtime === "bun"
			? packageManagers.filter((pm) => pm.value === "bun")
			: runtime === "deno"
				? packageManagers.filter((pm) => pm.value === "deno")
				: packageManagers;

	const checks = await Promise.all(
		supported.map(async (pm: (typeof packageManagers)[number]) => ({
			...pm,
			available: await isInstalled(pm.cmd),
		})),
	);

	return checks
		.filter((x) => x.available)
		.map((x) => ({
			value: x.value,
			label: x.value,
		}));
}
