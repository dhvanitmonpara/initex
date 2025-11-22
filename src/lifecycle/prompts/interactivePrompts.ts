import { consola } from "consola";
import { vice } from "gradient-string";
import {
	ProjectConfigSchema,
	type TProjectConfig,
} from "../../schemas/ProjectConfigSchema";
import {
	promptConfirm,
	promptSelect,
	promptText,
} from "../../utils/promptUtils";
import { handleDirConflict } from "../handleDirConflict";
import { parseCLIArgs } from "../parseCLIArguments";

export async function promptProjectConfig(): Promise<TProjectConfig> {
	const cliArgs = await parseCLIArgs();
	const isTesting = (cliArgs.mode === "test" ||
		cliArgs.mode === "test:bin") as boolean;

	let projectName =
		cliArgs.name ||
		(await promptText("Enter your project name:", "my-app", "my-app", (v) =>
			!v ? vice("Project name cannot be empty!") : undefined,
		));

	projectName = (isTesting ? `tests/${projectName}` : projectName) as string;
	await handleDirConflict(projectName);

	const language = await promptSelect<"js" | "ts">("Choose language:", [
		{ value: "ts", label: "TypeScript" },
		{ value: "js", label: "JavaScript" },
	]);

	const runtime = await promptSelect<"node" | "deno" | "bun">(
		"Choose runtime:",
		[
			{ value: "bun", label: "Bun" },
			{ value: "node", label: "Node.js" },
			{ value: "deno", label: "Deno" },
		],
	);

	let packageManager: "npm" | "yarn" | "pnpm" | "bun" | "deno" = "npm";
	if (runtime === "bun") {
		packageManager = "bun";
	} else if (runtime === "deno") {
		packageManager = "deno";
	} else {
		packageManager = await promptSelect<
			"npm" | "yarn" | "pnpm" | "bun" | "deno"
		>("Choose package manager:", [
			{ value: "bun", label: "bun" },
			{ value: "npm", label: "npm" },
			{ value: "yarn", label: "yarn" },
			{ value: "pnpm", label: "pnpm" },
			{ value: "deno", label: "deno" },
		]);
	}

	const dbEnable = (await promptConfirm(
		"Do you want to use a database?",
		true,
	)) as boolean;

	let db: TProjectConfig["db"] = {
		enable: dbEnable,
		provider: undefined,
		connectionString: undefined,
		name: undefined,
		orm: undefined,
	} as TProjectConfig["db"];

	if (dbEnable) {
		const provider = await promptSelect<"mongodb" | "postgresql" | "mysql">(
			"Select a database:",
			[
				{ value: "postgresql", label: "PostgreSQL" },
				{ value: "mongodb", label: "MongoDB" },
				{ value: "mysql", label: "MySQL" },
			],
		);

		const defaults = {
			postgresql: `postgres://postgres:password@localhost:5432/${projectName}`,
			mongodb: `mongodb://localhost:27017/${projectName}`,
			mysql: `mysql://root:password@localhost:3306/${projectName}`,
		} as const;

		const connectionString = (await promptText(
			"Enter the database connection string:",
			defaults[provider],
			defaults[provider],
		)) as string;

		const name = (await promptText(
			"Enter the database name:",
			"my_database",
			"my_database",
		)) as string;

		let orm: "mongoose" | "prisma" | "drizzle" | "sequelize";

		if (provider === "mongodb") {
			orm = "mongoose";
		} else {
			const options =
				provider === "postgresql"
					? [
							{ value: "drizzle", label: "Drizzle" },
							{ value: "prisma", label: "Prisma" },
							{ value: "sequelize", label: "Sequelize" },
						]
					: [
							{ value: "prisma", label: "Prisma" },
							{ value: "sequelize", label: "Sequelize" },
						];

			orm = (await promptSelect<(typeof options)[number]["value"]>(
				"Select ORM:",
				options,
			)) as typeof orm;
		}

		db = {
			enable: true,
			provider,
			connectionString,
			name,
			orm,
		} as TProjectConfig["db"];
	}

	const authEnable = dbEnable
		? ((await promptConfirm(
				"Do you want to use pre-built auth?",
				true,
			)) as boolean)
		: false;

	const smtpEnable = authEnable
		? true
		: ((await promptConfirm(
				"Do you want to use SMTP service?",
				true,
			)) as boolean);

	const smtpService = smtpEnable
		? await promptSelect<"nodemailer" | "resend">("Select an SMTP service:", [
				{ value: "nodemailer", label: "Nodemailer" },
				{ value: "resend", label: "Resend" },
			])
		: undefined;

	const cacheEnable = authEnable
		? true
		: ((await promptConfirm("Do you want to use caching?", true)) as boolean);

	const cacheService = cacheEnable
		? ((await promptSelect<"multi" | "nodecache">("Select a cache:", [
				{
					value: "multi",
					label: "Multi Level Cache (Node Cache + Redis)",
					hint: "Node Cache as L1 and Redis as L2",
				},
				{ value: "nodecache", label: "Node Cache" },
			])) as "multi" | "nodecache")
		: undefined;

	const socket = (await promptConfirm(
		"Do you want to use Socket.io?",
	)) as boolean;
	const git = (await promptConfirm(
		"Do you want to initialize git repo with husky?",
		true,
	)) as boolean;

	const rawConfig: TProjectConfig = {
		name: projectName as string,
		language: language as "js" | "ts",
		runtime,
		packageManager,
		db: db as TProjectConfig["db"],
		auth: { enable: authEnable } as TProjectConfig["auth"],
		cache: {
			enable: cacheEnable,
			service: cacheService,
		} as TProjectConfig["cache"],
		socket: socket as boolean,
		git: git as boolean,
		smtp: {
			enable: smtpEnable,
			service: smtpService,
		},
	} as TProjectConfig;

	const result = ProjectConfigSchema.safeParse(rawConfig);
	if (!result.success) {
		consola.error("❌ Invalid configuration:");
		for (const issue of result.error.issues) {
			consola.error(`→ ${issue.path.join(".")}: ${issue.message}`);
		}
		process.exit(1);
	}

	return result.data;
}
