import path from "node:path";
import fs from "fs-extra";
import Handlebars from "handlebars";
import { glob } from "tinyglobby";
import type { TProjectContext } from "../schema/ProjectConfigSchema";

export async function copyAndRenderTemplate(
	templatePath: string,
	targetPath: string,
	context: TProjectContext,
) {
	await fs.copy(templatePath, targetPath);

	const files = await glob("**/*.hbs", {
		cwd: targetPath,
		absolute: true,
		dot: true,
	});

	await Promise.all(
		files.map(async (filePath) => {
			try {
				const templateContent = await fs.readFile(filePath, "utf-8");
				const compiled = Handlebars.compile(templateContent);
				const rendered = compiled(context);

				let outputPath = filePath.replace(/\.hbs$/, "");

				if (context.ts && outputPath.endsWith(".js")) {
					outputPath = outputPath.replace(/\.js$/, ".ts");
				}

				await fs.ensureDir(path.dirname(outputPath));
				await fs.writeFile(outputPath, rendered, "utf-8");
				await fs.remove(filePath);
			} catch (err) {
				console.error(`❌ Failed to render template: ${filePath}`, err);
				throw err;
			}
		}),
	);
}
