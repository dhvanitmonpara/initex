import path from "node:path";
import { log } from "@clack/prompts";
import fs from "fs-extra";
import minimist from "minimist";

export type CLIConfig = {
	mode: "start" | "test" | "test:bin";
	name?: string;
	setup: "interactive" | "preset";
	interactive?: {
		generateJson?: string | null;
		savePreset?: boolean;
	};
	presetPath?: string | null;
};

export async function parseCLIArgs(): Promise<CLIConfig> {
	const argv = process.argv.slice(2);

	const args = minimist(argv, {
		string: ["mode", "name", "interactive"],
		boolean: ["test", "i", "p", "g", "s"],
		alias: {
			m: "mode",
			i: "interactive",
			p: "preset",
			g: "generateJson",
			s: "savePreset",
			n: "name",
		},
		default: {
			mode: "start",
			i: true,
		},
	});

	// --- Determine mode ---
	let mode: CLIConfig["mode"] = "start";
	if (args.test) mode = "test";
	else if (args.mode === "test" || args.mode === "test:bin")
		mode = args.mode as CLIConfig["mode"];

	const name = args.n || args.name || args._[0];

	// --- Determine setup priority ---
	// Priority: preset > interactive
	let setup: CLIConfig["setup"] = "interactive";
	if (args.p || args.preset) setup = "preset";

	// --- Handle interactive setup ---
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

	let interactive: CLIConfig["interactive"] | undefined;
	if (setup === "interactive") {
		interactive = {
			generateJson,
			savePreset: args.s || false,
		};
	}

	// --- Handle preset file setup ---
	let presetPath: string | null = null;
	if (setup === "preset") {
		if (!args.preset || typeof args.preset !== "string") {
			log.error(`--preset flag provided but no path specified`);
		}

		presetPath = path.resolve(args.preset);
		if (!fs.existsSync(presetPath)) {
			log.error(
				`Preset file not found: ${presetPath.replace(process.cwd(), ".")}`,
			);
		}
	}

	return { mode, name, setup, interactive, presetPath };
}
