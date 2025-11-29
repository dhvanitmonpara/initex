import path from "node:path";
import { fileURLToPath } from "node:url";
import minimist from "minimist";
import generateRandomString from "@/utils/generateRandomString";
import { normalizeProjectName } from "@/utils/normalizeProjectName";
import { parseConnectionString } from "@/utils/parseConnectionString";
import type {
  ProjectConfig,
  ProjectContext,
} from "../../schemas/ProjectConfigSchema";
import { copyAndRenderTemplate } from "./copyAndRender";
import handleDeps from "./handleDeps";

export async function generateProject(config: ProjectConfig) {
  const args = minimist(process.argv.slice(2), {
    string: ["mode"],
    alias: { m: "mode" },
    default: { mode: "start" },
  });

  const mode = args.mode;
  const basePath = mode === "test" ? "src/" : "";

  const projectRoot = path.resolve(process.cwd(), config.name);

  const context = createContext(config);

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const baseDir = path.resolve(__dirname, `${basePath}templates/base`);
  await copyAndRenderTemplate(baseDir, projectRoot, context);

  const selectedAddons = selectAddons(context);

  await handleDeps(selectedAddons, context, basePath, projectRoot, context);
}

const selectAddons = (config: ProjectContext) => {
  const selectedAddons: string[] = [];

  if (config.runtime === "bun") {
    selectedAddons.push("runtime/bun");
  } else {
    selectedAddons.push("runtime/node");
  }

  if (config.auth.enable) selectedAddons.push("auth");
  if (config.db.enable) selectedAddons.push(`db/${config.db.orm}`);
  if (config.smtp.enable) {
    selectedAddons.push(`smtp/base`);
    selectedAddons.push(`smtp/${config.smtp.service}`);
  }

  if (config.socket) selectedAddons.push("socket");
  if (config.cache.enable) selectedAddons.push(`cache/${config.cache.service}`);

  if (config.git) selectedAddons.push("git");

  return selectedAddons;
};

const createContext = (config: ProjectConfig): ProjectContext => {
  return {
    ...config,
    normalizedProjectName: normalizeProjectName(config.name),
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
    useGmail: config.smtp.service?.includes("gmail"),
    useResend: config.smtp.service?.includes("resend"),
    sequelizeDialect:
      config.db.provider === "postgresql" ? "postgres" : config.db.provider,
    ...(config.db.enable
      ? parseConnectionString(config.db.connectionString)
      : {}),
  };
};
