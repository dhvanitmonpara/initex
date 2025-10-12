import path from "node:path";
import fs from "fs-extra";
import yaml from "js-yaml";
import { ProjectConfigSchema } from "../schema/ProjectConfigSchema.js";

export async function loadConfig() {
	const configCandidates = [
		path.resolve(process.cwd(), "initex.config.json"),
		path.resolve(process.cwd(), "initex.config.yaml"),
		path.resolve(process.cwd(), "initex.config.yml"),
	];

	let rawConfig = {};

	for (const filePath of configCandidates) {
		if (await fs.pathExists(filePath)) {
			const ext = path.extname(filePath);
			if (ext === ".json") {
				rawConfig = await fs.readJson(filePath);
			} else if (ext === ".yaml" || ext === ".yml") {
				const content = await fs.readFile(filePath, "utf-8");
				rawConfig = yaml.load(content);
			}

			break;
		}
	}

	const parsedConfig = ProjectConfigSchema.parse(rawConfig);

	return parsedConfig;
}
