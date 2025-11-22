import path from "node:path";
import { log } from "@clack/prompts";
import fs from "fs-extra";
import { mind } from "gradient-string";
import yaml from "js-yaml";
import pc from "picocolors";
import {
	ProjectConfigSchema,
	type TProjectConfig,
} from "../schemas/ProjectConfigSchema.js";
import { handleDirConflict } from "./handleDirConflict.js";
import type { CLIConfig } from "./parseCLIArguments.js";

export async function loadConfig(config: CLIConfig) {
	try {
		const candidates = [
			config.loadPreset || null,
			"initex.preset.json",
			"initex.preset.yaml",
			"initex.preset.yml",
			"./initex/initex.preset.json",
			"./initex/initex.preset.yaml",
			"./initex/initex.preset.yml",
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

		if (!foundPath) {
			if (config.setup === "interactive") {
				return null;
			}
			log.error("Preset file not found.");
			return null;
		}
		log.step(mind(`✨ Found ${foundPath.replace(process.cwd(), ".")}`));

		const ext = path.extname(foundPath);
		let rawConfig: unknown;

		if (ext === ".json") {
			rawConfig = await fs.readJson(foundPath);
		} else if (ext === ".yaml" || ext === ".yml") {
			const content = await fs.readFile(foundPath, "utf-8");
			rawConfig = yaml.load(content, { schema: yaml.JSON_SCHEMA });
		} else {
			log.error(
				pc.red(`Unsupported config file type${ext ? `: ${pc.bold(ext)}` : ""}`),
			);
			return null;
		}

		if (!rawConfig || typeof rawConfig !== "object") {
			log.error(pc.red("Config file is empty or invalid."));
			return null;
		}

		(rawConfig as TProjectConfig).name = config.name ?? null;

		const validated = ProjectConfigSchema.parse(rawConfig);
		await handleDirConflict(validated.name);
		return validated;
	} catch (err) {
		log.error(pc.red(`Config load error: ${(err as Error).message}`));
		return null;
	}
}
