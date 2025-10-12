import path from "node:path";
import { fileURLToPath } from "node:url";
import { consola } from "consola";
import fs from "fs-extra";
import { vice } from "gradient-string";
import { glob } from "tinyglobby";
import { promptSelect, promptText } from "../helpers/promptUtils";
import {
	ProjectConfigSchema,
	type TProjectConfig,
} from "../schema/ProjectConfigSchema";
import { parseCLIArgs } from "./parseCLIArguments";

export async function promptPresetSelection(): Promise<TProjectConfig> {
	const cliArgs = parseCLIArgs();
	const isTesting = cliArgs.mode === "test" || cliArgs.mode === "test:bin";

	let projectName =
		cliArgs.name ||
		(await promptText("Enter your project name:", "my-app", "my-app", (v) =>
			!v ? vice("Project name cannot be empty!") : undefined,
		));

	projectName = isTesting ? `tests/${projectName}` : projectName;

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);

	const baseDir = path.resolve(
		__dirname,
		`${cliArgs.mode === "test" ? "src/" : ""}data/presets`,
	);
	console.log(baseDir);

	const files = await glob("**/*.json", { cwd: baseDir, absolute: true });

	const presets: { value: TProjectConfig; label: string }[] = [];

	for (const filePath of files) {
		try {
			const templateContent = await fs.readFile(filePath, "utf-8");

			let parsedContent: { preset?: TProjectConfig; name?: string } = {};
			try {
				parsedContent = JSON.parse(templateContent);
			} catch {
				const name = path.basename(filePath, ".json");
				parsedContent = { preset: parsedContent.preset, name };
			}

			if (!parsedContent.preset || !parsedContent.name) continue;

			presets.push({
				value: parsedContent.preset,
				label: parsedContent.name,
			});
		} catch (err) {
			consola.warn(`Failed to read preset file: ${filePath}`);
			consola.warn(err.message);
		}
	}

	if (!presets.length) {
		consola.error(
			"❌ No presets found. Make sure your data/presets folder contains valid .hbs templates.",
		);
		process.exit(1);
	}

	const selectedPreset = await promptSelect("Select a preset:", presets);

	const rawConfig: TProjectConfig = {
		...selectedPreset,
		name: projectName === "." ? "" : projectName,
	} as TProjectConfig;

	const result = ProjectConfigSchema.safeParse(rawConfig);
	if (!result.success) {
		consola.error("❌ Invalid configuration:");
		for (const issue of result.error.issues) {
			consola.error(`→ ${issue.path.join(".")}: ${issue.message}`);
		}
		process.exit(1);
	}

	return result.data;
}
