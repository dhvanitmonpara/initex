import path from "node:path";
import fs from "fs-extra";
import { mind } from "gradient-string";
import yaml from "js-yaml";
import pc from "picocolors";
import { ProjectConfigSchema } from "../schema/ProjectConfigSchema.js";

export async function loadConfig() {
	const configFiles = [
		"initex.config.json",
		"initex.config.yaml",
		"initex.config.yml",
	].map((f) => path.resolve(process.cwd(), f));

	let rawConfig = null;

	for (const filePath of configFiles) {
		if (await fs.pathExists(filePath)) {
			console.log(mind(`Found ${filePath} in your directory`));
			console.log(pc.bgBlue("loading config from it"));
			const ext = path.extname(filePath);
			if (ext === ".json") {
				rawConfig = await fs.readJson(filePath);
			} else {
				const content = await fs.readFile(filePath, "utf-8");
				rawConfig = yaml.load(content, { schema: yaml.JSON_SCHEMA });
			}
			break;
		}
	}

	if (!rawConfig || Object.keys(rawConfig).length === 0) {
		return null;
	}

	try {
		return ProjectConfigSchema.parse(rawConfig);
	} catch (err) {
		console.error(`Invalid config: ${err.message}`);
		return null;
	}
}
