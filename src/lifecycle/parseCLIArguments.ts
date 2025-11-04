import path from "node:path";
import fs from "fs-extra";
import minimist from "minimist";

export type CLIConfig = {
	mode: "start" | "test" | "test:bin";
	name?: string;
	setup: "custom" | "preset" | "config";
	custom?: {
		generateJson?: string | null;
		savePreset?: boolean;
	};
	configPath?: string | null;
};

export async function parseCLIArgs(): Promise<CLIConfig> {
	const argv = process.argv.slice(2);

	const args = minimist(argv, {
		string: ["mode", "name", "config"],
		boolean: ["test", "c", "p", "g", "s"],
		alias: {
			m: "mode",
			c: "custom",
			p: "preset",
			g: "generateJson",
			s: "savePreset",
			n: "name",
			C: "config",
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

	const name = args.n || args.name || args._[0];

	// --- Determine setup priority ---
	// Priority: config > custom > preset
	let setup: CLIConfig["setup"] = "preset";
	if (args.c) setup = "custom";
	if (args.config) setup = "config"; // config always wins

	// --- Handle custom setup ---
	let generateJson: string | null = null;
	const gIndex = argv.findIndex((a) => a === "-g" || a === "--generateJson");
	if (gIndex !== -1) {
		const next = argv[gIndex + 1];
		if (next && !next.startsWith("-")) {
			generateJson = path.resolve(next);
		} else {
			generateJson = path.resolve(
				process.cwd(),
				mode.startsWith("test") ? "tests" : "",
				name || "",
				"./.initex",
			);
		}
	}

	let custom: CLIConfig["custom"] | undefined;
	if (setup === "custom") {
		custom = {
			generateJson,
			savePreset: args.s || false,
		};
	}

	// --- Handle config file setup ---
	let configPath: string | null = null;
	if (setup === "config") {
		if (!args.config || typeof args.config !== "string") {
			throw new Error(`--config flag provided but no path specified`);
		}

		configPath = path.resolve(args.config);
		if (!fs.existsSync(configPath)) {
			throw new Error(`Config file not found: ${configPath}`);
		}
	}

	return { mode, name, setup, custom, configPath };
}
