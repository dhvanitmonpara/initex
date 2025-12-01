import path from "node:path";

export function normalizeProjectName(name: string) {
	name = name.trim();
	if (name === ".") {
		name = process.cwd();
	}
	const base = path.basename(path.normalize(name));
	return base.replace(/\s+/g, "");
}
