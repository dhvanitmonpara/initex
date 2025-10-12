import path from "node:path";
import { fileURLToPath } from "node:url";
import { execa } from "execa";
import fs from "fs-extra";
import minimist from "minimist";
import pc from "picocolors";
import { baseDeps, baseDevDeps } from "../constants/baseDeps";
import type {
	TProjectConfig,
	TProjectContext,
} from "../schema/ProjectConfigSchema";
import { copyAndRenderTemplate } from "./copyAndRender";

interface FeatureConfig {
	name: string;
	label: string;
	description: string;
	dependencies?: string[];
	conditionalDependencies?: Record<string, string[]>;
	destination?: string;
}

export async function generateProject(config: TProjectConfig) {
	const args = minimist(process.argv.slice(2), {
		string: ["mode"],
		alias: { m: "mode" },
		default: { mode: "start" },
	});

	const mode = args.mode;
	const basePath = mode === "test" ? "src/" : "";

	const projectRoot = path.resolve(process.cwd(), config.name);

	const context = {
		...config,
		ts: config.language === "ts",
	};

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);

	const baseDir = path.resolve(__dirname, `${basePath}templates/base`);
	await copyAndRenderTemplate(baseDir, projectRoot, context);

	const selectedFeatures = selectFeatures(context);
	const allDependencies: string[] = baseDeps;
	const allDevDependencies: string[] = baseDevDeps;

	if (context.ts) allDependencies.push("tsx", "typescript");
	if (context.ts)
		allDevDependencies.push(
			"@types/cookie-parser",
			"@types/express",
			"@types/jsonwebtoken",
			"@types/node",
		);

	console.log(selectedFeatures);

	for (const featureName of selectedFeatures) {
		const featurePath = path.resolve(
			__dirname,
			`${basePath}templates/features/${featureName}`,
		);
		const featureJsonPath = path.join(featurePath, "feature.json");

		if (!(await fs.pathExists(featureJsonPath))) continue;

		const featureConfig: FeatureConfig = await fs.readJSON(featureJsonPath);

		const destination = featureConfig.destination ?? "src";
		const targetPath = path.join(projectRoot, destination);

		await copyAndRenderTemplate(featurePath, targetPath, context);

		if (featureConfig.dependencies)
			allDependencies.push(...featureConfig.dependencies);

		if (featureConfig.conditionalDependencies && config.dbType) {
			const conditional = featureConfig.conditionalDependencies[config.dbType];
			if (conditional) allDependencies.push(...conditional);
		}
	}

	console.log(
		pc.cyan(
			`Installing ${allDependencies.length} dependencies and ${allDevDependencies.length} dev dependencies`,
		),
	);
	if (allDependencies.length > 0) {
		try {
			await execa("npm", ["install", ...allDependencies], {
				cwd: projectRoot,
				stdio: "pipe",
			});
		} catch (err) {
			pc.red(`Install failed: ${err.stderr}`);
		}
	}

	if (allDevDependencies.length > 0) {
		try {
			await execa("npm", ["install", "--save-dev", ...allDevDependencies], {
				cwd: projectRoot,
				stdio: "pipe",
			});
		} catch (err) {
			pc.red(`Install failed: ${err.stderr}`);
		}
	}

	console.log(`✅ Project "${config.name}" generated successfully!`);
}

const selectFeatures = (config: TProjectContext) => {
	const selectedFeatures: string[] = [];

	if (config.prebuiltAuth) selectedFeatures.push("auth");
	if (config.useSocket) selectedFeatures.push("socket");

	if (config.useDatabase) {
		const feature = "db";
		let path: string | null = null;
		if (config.dbType === "PostgreSQL") path = `${feature}/prisma`;
		if (config.dbType === "MySQL") path = `${feature}/sequelize`;
		selectedFeatures.push(path);
	}

	return selectedFeatures;
};
