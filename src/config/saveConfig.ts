import path from "node:path";
import fs from "fs-extra";
import type { TProjectConfig } from "../schema/ProjectConfigSchema";

export async function saveJson(
  fileName: string,
  data: TProjectConfig,
  pretty = true
) {
  if (!fileName.endsWith(".json")) {
    throw new Error("File name must end with .json");
  }

  if (typeof data !== "object" || data === null) {
    throw new Error("Data must be a non-null object");
  }

  const filePath = path.resolve(process.cwd(), fileName);

  // Ensure the directory exists
  await fs.ensureDir(path.dirname(filePath));

  // Write the file
  const jsonString = pretty
    ? JSON.stringify(data, null, 2)
    : JSON.stringify(data);

  await fs.writeFile(filePath, jsonString, "utf-8");

  return filePath;
}

export async function safeSaveJson(fileName: string, data: TProjectConfig) {
  try {
    return await saveJson(fileName, data);
  } catch (err) {
    console.error(`Failed to save JSON: ${err.message}`);
    return null;
  }
}
