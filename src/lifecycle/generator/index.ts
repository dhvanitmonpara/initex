import path from "node:path";
import { fileURLToPath } from "node:url";
import { log } from "@clack/prompts";
import { execa } from "execa";
import fs from "fs-extra";
import minimist from "minimist";
import pc from "picocolors";
import { baseDeps, baseDevDeps } from "../../data/baseDeps";
import type {
	TProjectConfig,
	TProjectContext,
} from "../../schemas/ProjectConfigSchema";
import deleteFile from "../../utils/deleteFile";
import { parseConnectionString } from "../../utils/parseConnectionString";
import { copyAndRenderTemplate } from "./copyAndRender";

interface FeatureConfig {
	name: string;
	label: string;
	description: string;
	dependencies?: string[];
	devDependencies?: string[];
	conditionalDependencies?: Record<string, string[]>;
	conditionalDevDependencies?: Record<string, string[]>;
	destination?: string;
	commands?: {
		cmd: string;
		args: string[];
	}[];
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

	const context: TProjectContext = {
		...config,
		ts: config.language === "ts",
		js: config.language === "js",
		noGit: !config.git,
		useRedis: config.cache.service === "redis",
		useMongodb: config.db.provider === "mongodb",
		usePrisma: config.db.orm === "prisma",
		useSequelize: config.db.orm === "sequelize",
		useDrizzle: config.db.orm === "drizzle",
		usePostgres: config.db.provider === "postgresql",
		useMysql: config.db.provider === "mysql",
		isBunRuntime: config.runtime === "bun",
		isDenoRuntime: config.runtime === "deno",
		isNodeRuntime: config.runtime === "node",
		runtimeCommand: config.runtime === "node" ? "npm" : config.runtime,
		runtimeExecCommand: config.runtime === "bun" ? "bun x" : "npx",
		useNodemailer: config.smtp.service === "nodemailer",
		...(config.db.enable
			? parseConnectionString(config.db.connectionString)
			: {}),
	};

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);

	const baseDir = path.resolve(__dirname, `${basePath}templates/base`);
	await copyAndRenderTemplate(baseDir, projectRoot, context);

	const selectedFeatures = selectFeatures(context);
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
		);
	}

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
}

const selectFeatures = (config: TProjectContext) => {
	const selectedFeatures: string[] = [];

	if (config.ts) {
		if (config.runtime === "bun") {
			selectedFeatures.push("runtime/bun");
		} else {
			selectedFeatures.push("runtime/node");
		}
	}

	if (config.auth.enable) selectedFeatures.push("auth");
	if (config.db.enable) selectedFeatures.push(`db/${config.db.orm}`);
	if (config.smtp.enable) selectedFeatures.push(`smtp/${config.smtp.service}`);

	if (config.socket) selectedFeatures.push("socket");
	if (config.cache.enable)
		selectedFeatures.push(`cache/${config.cache.service}`);

	if (config.git) selectedFeatures.push("git");

	return selectedFeatures;
};
