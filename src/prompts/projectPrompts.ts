import { consola } from "consola";
import { vice } from "gradient-string";
import {
  promptConfirm,
  promptSelect,
  promptText,
} from "../helpers/promptUtils";
import {
  ProjectConfigSchema,
  type TProjectConfig,
} from "../schema/ProjectConfigSchema";
import { parseCLIArgs } from "./parseCLIArguments";

export async function promptProjectConfig(): Promise<TProjectConfig> {
  const cliArgs = parseCLIArgs();
  const isTesting = (cliArgs.mode === "test" ||
    cliArgs.mode === "test:bin") as boolean;

  let projectName =
    cliArgs.name ||
    (await promptText("Enter your project name:", "my-app", "my-app", (v) =>
      !v ? vice("Project name cannot be empty!") : undefined
    ));

  projectName = (isTesting ? `tests/${projectName}` : projectName) as string;

  const expressVersion = (await promptText(
    "Enter Express version (leave empty for latest LTS):",
    "latest",
    "latest"
  )) as string;

  const language = await promptSelect<"js" | "ts">("Choose language:", [
    { value: "js", label: "JavaScript" },
    { value: "ts", label: "TypeScript" },
  ]);

  const dbEnable = (await promptConfirm(
    "Do you want to use a database?"
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
        { value: "mongodb", label: "MongoDB" },
        { value: "postgresql", label: "PostgreSQL" },
        { value: "mysql", label: "MySQL" },
      ]
    );

    const defaults = {
      mongodb: "mongodb://localhost:27017/",
      postgresql: "postgres://postgres:password@localhost:5432",
      mysql: "mysql://root:password@localhost:3306",
    } as const;

    const connectionString = (await promptText(
      "Enter the database connection string:",
      defaults[provider],
      defaults[provider]
    )) as string;

    const name = (await promptText(
      "Enter the database name:",
      "my_database",
      "my_database"
    )) as string;

    const orm =
      provider === "mongodb"
        ? ("mongoose" as "mongoose")
        : ((await promptSelect<"prisma" | "drizzle" | "sequelize">(
            "Select ORM:",
            [
              { value: "prisma", label: "Prisma" },
              { value: "drizzle", label: "Drizzle" },
              { value: "sequelize", label: "Sequelize" },
            ]
          )) as "prisma" | "drizzle" | "sequelize");

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
        true
      )) as boolean)
    : false;

  const cacheEnable = authEnable
    ? true
    : ((await promptConfirm("Do you want to use caching?", true)) as boolean);

  const cacheService = cacheEnable
    ? ((await promptSelect<"redis" | "nodecache">("Select a cache:", [
        { value: "redis", label: "Redis Cache" },
        { value: "nodecache", label: "Node Cache" },
      ])) as "redis" | "nodecache")
    : undefined;

  const socket = (await promptConfirm(
    "Do you want to use Socket.io?"
  )) as boolean;
  const git = (await promptConfirm(
    "Do you want to initialize git repo?",
    true
  )) as boolean;

  const rawConfig: TProjectConfig = {
    name: (projectName === "." ? "" : projectName) as string,
    expressVersion: expressVersion as string,
    language: language as "js" | "ts",
    db: db as TProjectConfig["db"],
    auth: { enable: authEnable } as TProjectConfig["auth"],
    cache: {
      enable: cacheEnable,
      service: cacheService,
    } as TProjectConfig["cache"],
    socket: socket as boolean,
    git: git as boolean,
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
