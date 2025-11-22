import path from "node:path";
import { fileURLToPath } from "node:url";
import minimist from "minimist";
import type {
	TProjectConfig,
	TProjectContext,
} from "../../schemas/ProjectConfigSchema";
import generateRandomString from "../../utils/generateRandomString";
import { parseConnectionString } from "../../utils/parseConnectionString";
import { copyAndRenderTemplate } from "./copyAndRender";
import handleDeps from "./handleDeps";

export async function generateProject(config: TProjectConfig) {
	const args = minimist(process.argv.slice(2), {
		string: ["mode"],
		alias: { m: "mode" },
		default: { mode: "start" },
	});

	const mode = args.mode;
	const basePath = mode === "test" ? "src/" : "";

	const projectRoot = path.resolve(process.cwd(), config.name);

	const context: TProjectContext = createContext(config);

	const __filename = fileURLToPath(import.meta.url);
	const __dirname = path.dirname(__filename);

	const baseDir = path.resolve(__dirname, `${basePath}templates/base`);
	await copyAndRenderTemplate(baseDir, projectRoot, context);

	const selectedFeatures = selectFeatures(context);

	await handleDeps(selectedFeatures, context, basePath, projectRoot, context);
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

const createContext = (config: TProjectConfig) => {
	return {
		...config,
		ts: config.language === "ts",
		js: config.language === "js",
		accessTokenSecret: generateRandomString(),
		refreshTokenSecret: generateRandomString(),
		noGit: !config.git,
		useMultiCache: config.cache.service === "multi",
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
};
