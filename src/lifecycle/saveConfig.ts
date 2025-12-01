import path from "node:path";
import fs from "fs-extra";
import type { ProjectConfig } from "../schemas/ProjectConfigSchema";

export async function saveJson(
	targetPath: string,
	data: ProjectConfig,
	pretty = true,
): Promise<string> {
	if (typeof targetPath !== "string" || !targetPath.trim()) {
		throw new Error("Target path must be a non-empty string");
	}

	if (typeof data !== "object" || data === null) {
		throw new Error("Data must be a non-null object");
	}

	const resolved = path.resolve(targetPath);

	const isFile = path.extname(resolved) === ".json";
	const filePath = isFile
		? resolved
		: path.join(resolved, "initex.preset.json");

	await fs.ensureDir(path.dirname(filePath));

	const jsonString = pretty
		? JSON.stringify(data, null, 2)
		: JSON.stringify(data);

	await fs.writeFile(filePath, jsonString, "utf-8");

	return filePath;
}

export async function safeSaveJson(
	targetPath: string,
	data: ProjectConfig,
): Promise<string | null> {
	try {
		return await saveJson(targetPath, data);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.error(`Failed to save JSON: ${message}`);
		return null;
	}
}
