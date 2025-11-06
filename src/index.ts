import { intro, log, outro } from "@clack/prompts";
import { consola } from "consola";
import { teen } from "gradient-string";
import pc from "picocolors";
import { InitexArt } from "./constants/initexArt";
import { generateProject } from "./lifecycle/generator/index";
import { handleDirConflict } from "./lifecycle/handleDirConflict";
import { loadConfig } from "./lifecycle/loadConfig";
import { parseCLIArgs } from "./lifecycle/parseCLIArguments";
import { promptProjectConfig } from "./lifecycle/prompts/customPrompts";
import { promptPresetSelection } from "./lifecycle/prompts/presetPrompts";
import { safeSaveJson } from "./lifecycle/saveConfig";
import type { TProjectConfig } from "./schemas/ProjectConfigSchema";

async function main() {
	const cliArgs = await parseCLIArgs();

	console.log(teen(InitexArt));
	intro(pc.italic(pc.cyan("Let's initialize your new project!")));

	let config: TProjectConfig = await loadConfig(cliArgs);
	if (
		cliArgs.setup === "custom" &&
		(!config || Object.keys(config).length === 0)
	) {
		config = await promptProjectConfig();

		if (cliArgs.custom.generateJson)
			safeSaveJson(cliArgs.custom.generateJson ?? ".", config);
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
	} else if (!config || Object.keys(config).length === 0) {
		await handleDirConflict(cliArgs.name);
		config = await promptPresetSelection();
	}

	await generateProject(config);

	log.success(`${pc.bold(pc.cyan("Project ready:"))} ${config.name}`);
	log.info(`Next steps:\n${pc.gray(`cd ${config.name} && npm install`)}`);

	outro(`Project ${pc.bold(pc.cyan(config.name))} created successfully!`);

	return config;
}

main().catch((err) => {
	consola.error("💥 Unexpected error:", err);
	process.exit(1);
});
