import path from "node:path";
import fs from "fs-extra";
import { vice } from "gradient-string";
import { promptSelect, promptText } from "../utils/promptUtils";

export async function doesDirHaveContent(dirPath: string) {
	const items = await fs.readdir(dirPath);
	return items.length > 0;
}

async function handleDirConflict(dirName: string) {
	const cwd = process.cwd();
	const dirPath = path.resolve(cwd, dirName);

	if (!dirPath.startsWith(cwd)) {
		throw new Error(
			`Refusing to operate outside current working directory: ${dirPath}`,
		);
	}

	await fs.ensureDir(dirPath);

	const hasContent = await doesDirHaveContent(dirPath);
	if (!hasContent) return dirName;

	const choice = await promptSelect(
		`The directory "${dirName}" is not empty. What do you want to do?`,
		[
			{ label: "Clean and continue", value: "clean" },
			{ label: "Continue without cleaning", value: "continue" },
			{ label: "Rename and continue", value: "rename" },
			{ label: "Exit", value: "exit" },
		],
	);

	switch (choice) {
		case "clean":
			console.log(`Cleaning directory: ${dirPath}`);
			await fs.rm(dirPath, { recursive: true, force: true });
			await fs.mkdir(dirPath);
			return dirName;

		case "continue":
			return dirName;

		case "rename": {
			const newName = await promptText(
				"Enter new directory name:",
				`${dirName}-new`,
				"",
				(v) => (!v ? vice("Directory name cannot be empty!") : undefined),
			);
			return newName;
		}

		case "exit":
			console.log("Exiting.");
			process.exit(0);
			break;
		default:
			console.log("Exiting.");
			process.exit(0);
	}
}

export { handleDirConflict };
