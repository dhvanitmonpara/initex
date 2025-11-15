import path from "node:path";
import { fileURLToPath } from "node:url";
import { log } from "@clack/prompts";
import { execa } from "execa";
import fs from "fs-extra";
import pc from "picocolors";
import { baseDeps, baseDevDeps } from "../../data/baseDeps";
import type { TProjectContext } from "../../schemas/ProjectConfigSchema";
import type { FeatureConfig } from "../../types/FeatureConfig";
import deleteFile from "../../utils/deleteFile";
import { copyAndRenderTemplate } from "./copyAndRender";

const handleDeps = async (
	selectedFeatures: string[],
	config: TProjectContext,
	basePath: string,
	projectRoot: string,
	context: TProjectContext,
) => {
	const allDependencies: string[] = baseDeps;
	const allDevDependencies: string[] = baseDevDeps;
	const commands = [];

	if (context.ts) {
		allDependencies.push("typescript");
		allDevDependencies.push(
			"@types/cookie-parser",
			"@types/express",
			"@types/jsonwebtoken",
			"@types/node",
			"@types/cors",
			"@types/swagger-jsdoc",
			"@types/swagger-ui-express",
			"@types/multer",
		);
	}

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);

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

		if (featureConfig.devDependencies)
			allDevDependencies.push(...featureConfig.devDependencies);

		if (featureConfig.conditionalDependencies && config.db.provider) {
			const conditional =
				featureConfig.conditionalDependencies[config.db.provider];
			if (conditional) allDependencies.push(...conditional);
		}

		if (featureConfig.conditionalDependencies && config.db.provider) {
			const conditional =
				featureConfig.conditionalDependencies[config.db.provider];
			if (conditional) allDependencies.push(...conditional);
		}

		if (featureConfig.conditionalDevDependencies && config.db.provider) {
			const conditional =
				featureConfig.conditionalDevDependencies[config.db.provider];
			if (conditional) allDevDependencies.push(...conditional);
		}

		if (featureConfig.commands && featureConfig.commands?.length > 0) {
			commands.push(...featureConfig.commands);
		}
	}

	log.info(
		pc.cyan(
			`Installing ${allDependencies.length} dependencies and ${allDevDependencies.length} dev dependencies`,
		),
	);

	const installArg = config.packageManager === "npm" ? "install" : "add";

	if (allDependencies.length > 0) {
		try {
			await execa(config.packageManager, [installArg, ...allDependencies], {
				cwd: projectRoot,
				stdio: "pipe",
			});
		} catch (err) {
			log.error(pc.red(`Install failed: ${err.stderr}`));
			log.info(pc.red(`Dependencies: ${allDependencies.join(", ")}`));
		}
	}

	if (allDevDependencies.length > 0) {
		try {
			const devFlag = ["deno", "bun"].includes(config.packageManager)
				? "--dev"
				: "-D";
			await execa(
				config.packageManager,
				[installArg, devFlag, ...allDevDependencies],
				{
					cwd: projectRoot,
					stdio: "pipe",
				},
			);
		} catch (err) {
			log.error(pc.red(`Install failed: ${err.stderr}`));
			log.info(pc.red(`Dev dependencies: ${allDevDependencies.join(", ")}`));
		}
	}

	if (commands.length > 0) {
		for (const { cmd, args } of commands) {
			const cmdExec = cmd
				.replace("npm", config.packageManager)
				.replace("npx", config.runtime === "bun" ? "bunx" : "npx");
			try {
				await execa(cmdExec, args, {
					cwd: projectRoot,
					stdio: "pipe",
				});
			} catch (err) {
				log.error(
					pc.red(
						`Command failed (${cmdExec} ${args.join(" ")}): ${err.stderr}`,
					),
				);
			}
		}
	}

	if (["pnpm", "bun", "yarn"].includes(config.packageManager)) {
		deleteFile(path.join(projectRoot, "package-lock.json"));
	}
};

export default handleDeps;
