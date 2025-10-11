import z from "zod";
export const ProjectConfigSchema = z
    .object({
    name: z.string().min(1, "Project name cannot be empty."),
    expressVersion: z.string().optional(),
    useDatabase: z.boolean(),
    dbType: z.enum(["MongoDB", "PostgreSQL", "MySQL"]).optional(),
    dbConnectionString: z.url("Invalid database connection string.").optional(),
    dbName: z.string().min(1, "Database name cannot be empty.").optional(),
    prebuiltAuth: z.boolean(),
    useSocket: z.boolean(),
    language: z.enum(["js", "ts"]),
})
    .superRefine((data, ctx) => {
    if (data.useDatabase) {
        if (!data.dbType) {
            ctx.addIssue({
                path: ["dbType"],
                message: "Database type is required when using a database.",
                code: "custom",
            });
        }
        if (!data.dbConnectionString) {
            ctx.addIssue({
                path: ["dbConnectionString"],
                message: "Connection string required.",
                code: "custom",
            });
        }
        if (!data.dbName) {
            ctx.addIssue({
                path: ["dbName"],
                message: "Database name is required.",
                code: "custom",
            });
        }
    }
});
