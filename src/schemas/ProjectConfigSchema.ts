import z from "zod";

export const ProjectConfigSchema = z
  .object({
    name: z.string().min(1, "Project name cannot be empty."),
    db: z.object({
      enable: z.boolean().default(false),
      provider: z.enum(["mongodb", "postgresql", "mysql"]).optional(),
      connectionString: z.url("Invalid database connection string.").optional(),
      orm: z.enum(["mongoose", "prisma", "sequelize", "drizzle"]).optional(),
      name: z.string().min(1, "Database name cannot be empty.").optional(),
    }),
    cache: z.object({
      enable: z.boolean().default(false),
      service: z.enum(["nodecache", "multi"]).optional(),
    }),
    auth: z.object({
      enable: z.boolean().default(false),
    }),
    smtp: z.object({
      enable: z.boolean().default(false),
      service: z.enum(["resend", "gmail"]).optional(),
    }),
    git: z.boolean().default(false),
    socket: z.boolean().default(false),
    runtime: z.enum(["node", "deno", "bun"]).default("node"),
    packageManager: z
      .enum(["npm", "yarn", "pnpm", "bun", "deno"])
      .default("npm"),
  })
  .superRefine((data, ctx) => {
    if (data.db.enable) {
      if (!data.db.provider) {
        ctx.addIssue({
          path: ["db.provider"],
          message: "Database provider is required when using a database.",
          code: "custom",
        });
      }
      if (!data.db.connectionString) {
        ctx.addIssue({
          path: ["db.connectionString"],
          message: "Connection string required.",
          code: "custom",
        });
      }
      if (!data.db.name) {
        ctx.addIssue({
          path: ["db.name"],
          message: "Database name is required.",
          code: "custom",
        });
      }
    }
  });

export type ProjectConfig = z.infer<typeof ProjectConfigSchema>;
export type ProjectContext = ProjectConfig & {
  normalizedProjectName: string;
  accessTokenSecret: string;
  refreshTokenSecret: string;
  noGit: boolean;
  useMultiCache: boolean;
  useMongodb: boolean;
  usePrisma: boolean;
  useSequelize: boolean;
  useDrizzle: boolean;
  usePostgres: boolean;
  useMysql: boolean;
  dbType?: string;
  dbUser?: string;
  dbPassword?: string;
  dbHost?: string;
  dbPort?: string;
  dbName?: string;
  sequelizeDialect?: string;
  isBunRuntime: boolean;
  isDenoRuntime: boolean;
  isNodeRuntime: boolean;
  runtimeCommand: string;
  runtimeExecCommand: string;
  useGmail: boolean;
  useResend: boolean;
};
