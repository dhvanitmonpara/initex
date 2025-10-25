import minimist from "minimist";

export type CLIConfig = {
	mode: "start" | "test" | "test:bin";
	name?: string;
	setup: "custom" | "preset";
	custom?: {
		generateJson?: boolean;
		savePreset?: boolean;
	};
};

export function parseCLIArgs(): CLIConfig {
	const args = minimist(process.argv.slice(2), {
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

	// Determine mode
	let mode: CLIConfig["mode"] = "start";
	if (args.test) mode = "test";
	else if (args.mode === "test" || args.mode === "test:bin")
		mode = args.mode as CLIConfig["mode"];

	// Determine setup type
	const setup: "custom" | "preset" = args.c ? "custom" : "preset";

	// Extract positional project name
	const name = args._[0] as string | undefined;

	// Handle custom flags
	let custom: CLIConfig["custom"] | undefined;
	if (setup === "custom") {
		custom = {
			generateJson: args.g || false,
			savePreset: args.s || false,
		};
	}

	return { mode, name, setup, custom };
}
