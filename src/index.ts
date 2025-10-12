import { intro, log, outro } from "@clack/prompts";
import { consola } from "consola";
import { teen } from "gradient-string";
import pc from "picocolors";
import { loadConfig } from "./config/loadConfig";
import { safeSaveJson } from "./config/saveConfig";
import { generateProject } from "./generator/index";
import { parseCLIArgs } from "./prompts/parseCLIArguments";
import { promptPresetSelection } from "./prompts/presetPrompts";
import { promptProjectConfig } from "./prompts/projectPrompts";
import type { TProjectConfig } from "./schema/ProjectConfigSchema";

async function main() {
	const cliArgs = parseCLIArgs();

	consola.box(teen("🚀 Welcome to Initex CLI"));
	intro(pc.italic(pc.cyan("Let's initialize your new project!")));
	console.log(cliArgs);

	let config: TProjectConfig = await loadConfig();
	if (
		cliArgs.setup === "custom" &&
		(!config || Object.keys(config).length === 0)
	) {
		config = await promptProjectConfig();

		if (cliArgs.custom.generateJson) safeSaveJson("initex.config.json", config);
		if (cliArgs.custom.savePreset) {
			consola.log(
				pc.red(
					"flag -s will save this preset into global package. you could lose that if you update or uninstall the package",
				),
			);
			consola.log(
				pc.blue("So it is recommended to use a file generator (-g) instead"),
			);
		}
	} else {
		config = await promptPresetSelection();
	}

	await generateProject(config);

	log.success(`${pc.bold(pc.cyan("Project ready:"))} ${config.name}`);
	log.info(`Next steps:\n${pc.gray(`cd ${config.name} && npm install`)}`);

	outro(
		`Project ${pc.bold(pc.cyan(config.name))} created with express version ${
			config.expressVersion
		}`,
	);

	return config;
}

main().catch((err) => {
	consola.error("💥 Unexpected error:", err);
	process.exit(1);
});
