import { confirm, isCancel, select, text } from "@clack/prompts";
import { consola } from "consola";
import { vice } from "gradient-string";
import minimist from "minimist";
import {
	ProjectConfigSchema,
	type TProjectConfig,
} from "../schema/ProjectConfigSchema";

export async function promptProjectConfig(): Promise<TProjectConfig> {
	const args = minimist(process.argv.slice(2), {
		string: ["mode"],
		alias: { m: "mode" },
		default: { mode: "start" },
	});

	let projectName = args._[0];
	const mode = args.mode;
	const isTesting = mode === "test";

	// Project Name
	if (!projectName) {
		const nameInput = await text({
			message: "Enter your project name:",
			placeholder: "my-app",
			initialValue: "my-app",
			validate(value) {
				if (!value) return vice("Project name cannot be empty!");
			},
		});

		if (isCancel(nameInput)) {
			consola.warn("Operation cancelled.");
			process.exit(0);
		}

		projectName = nameInput as string;
	}

	projectName = isTesting ? `tests/${projectName}` : (projectName as string);

	// Express Version
	const expressVersionInput = await text({
		message: "Enter Express version (leave empty for latest LTS):",
		placeholder: "latest",
		initialValue: "latest",
	});
	if (isCancel(expressVersionInput)) process.exit(0);
	const expressVersion = expressVersionInput || "latest";

	// ts or js
	const language = await select({
		message: "Choose language:",
		options: [
			{ value: "js", label: "JavaScript" },
			{ value: "ts", label: "TypeScript" },
		],
	});
	if (isCancel(language)) process.exit(0);

	// Database Setup
	const useDatabase = await confirm({
		message: "Do you want to use a database?",
		initialValue: false,
	});
	if (isCancel(useDatabase)) process.exit(0);

	let dbType: "MongoDB" | "PostgreSQL" | "MySQL" | undefined;
	let dbConnectionString: string | undefined;
	let dbName: string | undefined;
	let prebuiltAuth: boolean | undefined;

	if (useDatabase) {
		const dbTypeSelection = await select({
			message: "Select a database:",
			options: [
				{ value: "MongoDB", label: "MongoDB" },
				{ value: "PostgreSQL", label: "PostgreSQL" },
				{ value: "MySQL", label: "MySQL" },
			],
		});
		if (isCancel(dbTypeSelection)) process.exit(0);
		dbType = dbTypeSelection as "MongoDB" | "PostgreSQL" | "MySQL";

		const defaults = {
			MongoDB: "mongodb://localhost:27017/",
			PostgreSQL: "postgres://postgres:password@localhost:5432",
			MySQL: "mysql://root:password@localhost:3306",
		} as const;

		const connectionInput = await text({
			message: "Enter the database connection string:",
			placeholder: defaults[dbType],
			initialValue: defaults[dbType],
		});
		if (isCancel(connectionInput)) process.exit(0);
		dbConnectionString = connectionInput as string;

		const dbNameInput = await text({
			message: "Enter the database name:",
			placeholder: "my_database",
			initialValue: "my_database",
		});
		if (isCancel(dbNameInput)) process.exit(0);
		dbName = dbNameInput as string;

		const usePrebuiltAuth = await confirm({
			message: "Do you want to use pre built auth?",
			initialValue: true,
		});
		if (isCancel(usePrebuiltAuth)) process.exit(0);
		prebuiltAuth = usePrebuiltAuth;
	}

	// Other options
	const useSocket = await confirm({
		message: "Do you want to use Socket.io?",
		initialValue: false,
	});
	if (isCancel(useSocket)) process.exit(0);

	// Normalize name
	const normalizeProjectName = (n: string) => (n === "." ? "" : n);
	const normalizedProjectName = normalizeProjectName(projectName);

	const rawConfig: TProjectConfig = {
		name: normalizedProjectName,
		expressVersion,
		useDatabase,
		dbType,
		dbConnectionString,
		dbName,
		prebuiltAuth,
		useSocket,
		language,
	};

	// Validate with Zod
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
