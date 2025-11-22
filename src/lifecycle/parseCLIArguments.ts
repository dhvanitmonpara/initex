import path from "node:path";
import { log } from "@clack/prompts";
import fs from "fs-extra";
import minimist from "minimist";

export type CLIConfig = {
	mode: "start" | "test" | "test:bin";
	name?: string;
	setup: "interactive" | "preset";
	generatePreset: string | null;
	loadPreset: string | null;
};

export async function parseCLIArgs(): Promise<CLIConfig> {
	const argv = process.argv.slice(2);

	const args = minimist(argv, {
		alias: {
			m: "mode",
			n: "name",
			p: "preset",
			g: "generatePreset",
			d: "debug",
		},
		string: ["mode", "name", "preset", "generatePreset"],
		boolean: ["debug"],
		default: {
			mode: "start",
		},
	});

	const hasFlag = (flag: string) =>
		argv.includes(flag) || argv.includes(flag.replace("--", "-"));

	const validModes = ["start", "test", "test:bin"] as const;
	const mode = validModes.includes(args.mode)
		? (args.mode as (typeof validModes)[number])
		: "start";

	const name = args.name || args._[0] || undefined;

	let loadPreset: string | null = null;
	let presetMode = false;

	if (hasFlag("-p") || hasFlag("--preset")) {
		presetMode = true;

		// If a path was given
		if (typeof args.preset === "string" && args.preset.trim() !== "") {
			const resolved = path.resolve(args.preset);
			if (fs.existsSync(resolved)) {
				loadPreset = resolved;
			} else {
				log.error(
					`Preset file not found: ${resolved.replace(process.cwd(), ".")}`,
				);
			}
		}
	}

	let generatePreset: string | null = null;

	if (hasFlag("-g") || hasFlag("--generatePreset")) {
		if (
			typeof args.generatePreset === "string" &&
			args.generatePreset.trim() !== ""
		) {
			generatePreset = path.resolve(args.generatePreset);
		} else {
			generatePreset = path.resolve(
				mode.startsWith("test") ? "tests" : "",
				name ?? "",
				".initex",
			);
		}
	}

	const setup = presetMode ? "preset" : "interactive";

	const config: CLIConfig = { mode, name, setup, generatePreset, loadPreset };
	if (args.debug) {
		console.log("---");
		console.log(config);
		console.log("---");
	}

	return config;
}
