import path from "node:path";
import minimist from "minimist";

export type CLIConfig = {
	mode: "start" | "test" | "test:bin";
	name?: string;
	setup: "custom" | "preset";
	custom?: {
		generateJson?: string | null;
		savePreset?: boolean;
	};
};

export async function parseCLIArgs(): Promise<CLIConfig> {
	const argv = process.argv.slice(2);

	const args = minimist(argv, {
		string: ["mode", "name"],
		boolean: ["test", "c", "p", "g", "s"],
		alias: {
			m: "mode",
			c: "custom",
			p: "preset",
			g: "generateJson",
			s: "savePreset",
			n: "name",
		},
		default: {
			mode: "start",
			p: true,
		},
	});

	// --- Determine mode ---
	let mode: CLIConfig["mode"] = "start";
	if (args.test) mode = "test";
	else if (args.mode === "test" || args.mode === "test:bin")
		mode = args.mode as CLIConfig["mode"];

	const setup: "custom" | "preset" = args.c ? "custom" : "preset";

	const name = args._[0] as string | undefined;

	let generateJson: string | null = null;

	const gIndex = argv.findIndex((a) => a === "-g" || a === "--generateJson");
	if (gIndex !== -1) {
		const next = argv[gIndex + 1];

		if (next && !next.startsWith("-")) {
			generateJson = path.resolve(next);
		} else {
			generateJson = process.cwd();
		}
	}

	let custom: CLIConfig["custom"] | undefined;
	if (setup === "custom") {
		custom = {
			generateJson,
			savePreset: args.s || false,
		};
	}

	return { mode, name, setup, custom };
}
