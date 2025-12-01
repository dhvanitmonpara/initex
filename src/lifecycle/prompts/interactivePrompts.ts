import { consola } from "consola";
import { vice } from "gradient-string";
import { handleDirConflict } from "@/lifecycle/handleDirConflict";
import { parseCLIArgs } from "@/lifecycle/parseCLIArguments";
import {
	type ProjectConfig,
	ProjectConfigSchema,
} from "@/schemas/ProjectConfigSchema";
import {
	getAvailablePackageManagers,
	getAvailableRuntimes,
} from "@/utils/environment";
import { normalizeProjectName } from "@/utils/normalizeProjectName";
import { promptConfirm, promptSelect, promptText } from "@/utils/promptUtils";

export async function promptProjectConfig(): Promise<ProjectConfig> {
	const cliArgs = await parseCLIArgs();
	const isTesting = cliArgs.mode === "test" || cliArgs.mode === "test:bin";

	// PROJECT NAME
	let projectName =
		cliArgs.name ||
		(await promptText("Enter your project name:", "my-app", "my-app", (v) =>
			!v ? vice("Project name cannot be empty!") : undefined,
		));

	projectName = isTesting ? `tests/${projectName}` : projectName;
	await handleDirConflict(projectName);
	const normalizedProjectName = normalizeProjectName(projectName);

	const runtimeOptions = await getAvailableRuntimes();

	if (runtimeOptions.length === 0) {
		consola.error("❌ No supported runtime installed on this machine.");
		process.exit(1);
	}

	const runtime = await promptSelect<"node" | "bun" | "deno">(
		"Choose runtime:",
		runtimeOptions,
	);

	const pmOptions = await getAvailablePackageManagers(runtime);

	if (pmOptions.length === 0) {
		consola.error(`No package managers installed for runtime "${runtime}".`);
		process.exit(1);
	}

	const packageManager = await selectOrAutoPick<
		ProjectConfig["packageManager"]
	>("Choose package manager:", pmOptions);

	// DATABASE
	const dbProvider = await promptSelect<
		"none" | "postgresql" | "mongodb" | "mysql"
	>("Select a database:", [
		{ value: "none", label: "None" },
		{ value: "postgresql", label: "PostgreSQL" },
		{ value: "mongodb", label: "MongoDB" },
		{ value: "mysql", label: "MySQL" },
	]);

	let db: ProjectConfig["db"] = {
		enable: dbProvider !== "none",
		provider: undefined,
		connectionString: undefined,
		name: undefined,
		orm: undefined,
	};

	if (dbProvider !== "none") {
		const defaults = {
			postgresql: `postgres://postgres:password@localhost:5432/${normalizedProjectName}`,
			mongodb: `mongodb://localhost:27017/${normalizedProjectName}`,
			mysql: `mysql://root:password@localhost:3306/${normalizedProjectName}`,
		} as const;

		const connectionString = await promptText(
			"Enter the database connection string:",
			defaults[dbProvider],
			defaults[dbProvider],
		);

		const name = await promptText(
			"Enter the database name:",
			"my_database",
			normalizedProjectName,
		);

		let orm: "mongoose" | "prisma" | "drizzle" | "sequelize";

		if (dbProvider === "mongodb") {
			orm = "mongoose";
		} else {
			orm = await promptSelect<"drizzle" | "prisma" | "sequelize">(
				"Select ORM:",
				[
					...(dbProvider === "postgresql"
						? [{ value: "drizzle", label: "Drizzle" } as const]
						: []),
					{ value: "prisma", label: "Prisma" },
					{ value: "sequelize", label: "Sequelize" },
				],
			);
		}

		db = {
			enable: true,
			provider: dbProvider,
			connectionString,
			name,
			orm,
		};
	}

	// AUTH
	const authEnable =
		db.enable &&
		(await promptSelect<"yes" | "no">("Use pre-built auth?", [
			{ value: "yes", label: "Yes" },
			{ value: "no", label: "No" },
		])) === "yes";

	// SMTP
	const smtpService = await promptSelect<"none" | "resend" | "gmail">(
		"Select SMTP service:",
		[
			...(authEnable ? [] : [{ value: "none", label: "None" } as const]),
			{ value: "resend", label: "Resend", hint: "Built-in templates support" },
			{ value: "gmail", label: "Gmail", hint: "Nodemailer SMTP" },
		],
	);

	// CACHE
	const cacheEnable = true;
	let cacheService: "multi" | "nodecache" | undefined;

	if (authEnable) {
		cacheService = "multi"; // forced
	} else {
		const cacheChoice = await promptSelect<"none" | "nodecache" | "multi">(
			"Select a cache:",
			[
				{ value: "none", label: "None" },
				{ value: "nodecache", label: "Node Cache" },
				{
					value: "multi",
					label: "Multi Level (NodeCache + Redis)",
				},
			],
		);

		cacheService = cacheChoice !== "none" ? cacheChoice : undefined;
	}

	// SOCKET & GIT
	const socket = await promptConfirm("Use Socket.io?");
	const git = await promptConfirm("Initialize git repo with husky?", true);

	// BUILD CONFIG
	const rawConfig: ProjectConfig = {
		name: projectName,
		runtime,
		packageManager,
		db,
		auth: { enable: authEnable },
		cache: {
			enable: cacheEnable,
			service: cacheService,
		},
		socket,
		git,
		smtp: {
			enable: smtpService !== "none",
			service: smtpService === "none" ? undefined : smtpService,
		},
	};

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

export async function selectOrAutoPick<T>(
	message: string,
	options: { value: string; label: string }[],
): Promise<T> {
	if (options.length === 0) {
		throw new Error("No options available");
	}
	if (options.length === 1) {
		return options[0].value as T;
	}
	return promptSelect(message, options) as Promise<T>;
}
