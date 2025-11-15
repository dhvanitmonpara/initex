import path from "node:path";
import fs from "fs-extra";
import Handlebars from "handlebars";
import { glob } from "tinyglobby";
import type { TProjectContext } from "../../schemas/ProjectConfigSchema";

export async function copyAndRenderTemplate(
	templatePath: string,
	targetPath: string,
	context: TProjectContext,
) {
	await fs.copy(templatePath, targetPath, {
		filter: (src) => {
			try {
				const base = path.basename(src);
				if (base === "feature.json") return false;
				if (context.js && base === "types") return false;
				return true;
			} catch (_) {
				return true;
			}
		},
	});

	const files = await glob("**/*.hbs", {
		cwd: targetPath,
		absolute: true,
		dot: true,
		ignore: [
			"feature.json",
			"**/feature.json",
			...(context.js ? ["**/*.ts.hbs", "**/types/**"] : []),
		],
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

				if (context.ts && outputPath.endsWith(".jsx")) {
					outputPath = outputPath.replace(/\.jsx$/, ".tsx");
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
