import path from "node:path";
import { log } from "@clack/prompts";
import fs from "fs-extra";
import { mind } from "gradient-string";
import yaml from "js-yaml";
import pc from "picocolors";
import { ProjectConfigSchema } from "../schemas/ProjectConfigSchema.js";
import type { CLIConfig } from "./parseCLIArguments.js";

export async function loadConfig(config: CLIConfig) {
	try {
		const candidates = [
			config.configPath || null,
			"initex.config.json",
			"initex.config.yaml",
			"initex.config.yml",
			"./initex/initex.config.json",
			"./initex/initex.config.yaml",
			"./initex/initex.config.yml",
		]
			.filter((f): f is string => typeof f === "string" && f.trim().length > 0)
			.map((f) => path.resolve(process.cwd(), f));

		let foundPath: string | null = null;
		for (const filePath of candidates) {
			if (await fs.pathExists(filePath)) {
				foundPath = filePath;
				break;
			}
		}

		if (!foundPath) return null;
		log.step(mind(`✨ Found ${foundPath.replace(process.cwd(), ".")}`));

		const ext = path.extname(foundPath);
		let rawConfig: unknown;

		if (ext === ".json") {
			rawConfig = await fs.readJson(foundPath);
		} else if (ext === ".yaml" || ext === ".yml") {
			const content = await fs.readFile(foundPath, "utf-8");
			rawConfig = yaml.load(content, { schema: yaml.JSON_SCHEMA });
		} else {
			throw new Error(`Unsupported config file type: ${ext}`);
		}

		if (!rawConfig || typeof rawConfig !== "object") {
			throw new Error("Config file is empty or invalid.");
		}

		const validated = ProjectConfigSchema.parse(rawConfig);
		return validated;
	} catch (err) {
		console.error(pc.red(`\n💥 Config load error:`));
		console.error(pc.red((err as Error).message));
		return null;
	}
}
