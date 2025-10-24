import z from "zod";

export const ProjectConfigSchema = z
	.object({
		name: z.string().min(1, "Project name cannot be empty."),
		expressVersion: z.string().optional(),
		db: z.object({
			enable: z.boolean().default(false),
			provider: z.enum(["mongodb", "postgresql", "mysql"]).optional(),
			connectionString: z.url("Invalid database connection string.").optional(),
			orm: z.enum(["mongoose", "prisma", "sequelize", "drizzle"]).optional(),
			name: z.string().min(1, "Database name cannot be empty.").optional(),
		}),
		cache: z.object({
			enable: z.boolean().default(false),
			service: z.enum(["nodecache", "redis"]).optional(),
		}),
		auth: z.object({
			enable: z.boolean().default(false),
		}),
		git: z.boolean().default(false),
		socket: z.boolean().default(false),
		language: z.enum(["js", "ts"]).default("js"),
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

export type TProjectConfig = z.infer<typeof ProjectConfigSchema>;
export type TProjectContext = TProjectConfig & {
	ts: boolean;
	js: boolean;
	useRedis: boolean;
	useMongodb: boolean;
	usePrisma: boolean;
	useSequelize: boolean;
	useDrizzle: boolean;
	usePostgres: boolean;
	useMysql: boolean;
};
