import { intro, log, outro } from "@clack/prompts";
import { consola } from "consola";
import { teen } from "gradient-string";
import pc from "picocolors";
import { InitexArt } from "./constants/initexArt";
import { generateProject } from "./lifecycle/generator/index";
import { loadConfig } from "./lifecycle/loadConfig";
import { parseCLIArgs } from "./lifecycle/parseCLIArguments";
import { promptProjectConfig } from "./lifecycle/prompts/interactivePrompts";
import { safeSaveJson } from "./lifecycle/saveConfig";
import type { ProjectConfig } from "./schemas/ProjectConfigSchema";
import { promptConfirm, promptText } from "./utils/promptUtils";

async function main() {
	const cliArgs = await parseCLIArgs();

	console.log(teen(InitexArt));
	intro(pc.italic(pc.cyan("Let's initialize your new project!")));

	let config: ProjectConfig = await loadConfig(cliArgs);

	if (!config || Object.keys(config).length === 0) {
		config = await promptProjectConfig();

		if (cliArgs.generatePreset)
			safeSaveJson(cliArgs.generatePreset || ".", config);
	} else {
		const continuePrompt = await promptConfirm(
			`Project config loaded with name ${pc.bold(
				config.name,
			)}. Do you want to continue?`,
			true,
		);

		if (!continuePrompt) {
			log.error("Project initialization cancelled.");
			process.exit(0);
		}

		if (!config.name) {
			const newProjectName = await promptText("Enter a new project name:");
			if (newProjectName) config.name = newProjectName;
		}
	}

	await generateProject(config);

	log.success(`${pc.bold(pc.cyan("Project ready:"))} ${config.name}`);

	const nextStepMessage = `${pc.gray(
		(config.name !== "." && `cd ${config.name} && `) +
			`${config.packageManager} run dev`,
	)}`;

	log.info(`Next steps:\n${nextStepMessage}`);

	outro(`Project ${pc.bold(pc.cyan(config.name))} created successfully!`);

	return config;
}

main().catch((err) => {
	consola.error("💥 Unexpected error:", err);
	process.exit(1);
});
