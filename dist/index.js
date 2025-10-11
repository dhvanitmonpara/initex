// src/index.ts
import { intro, log, outro } from "@clack/prompts";
import { consola as consola2 } from "consola";
import { teen } from "gradient-string";
import pc2 from "picocolors";

// src/generator/index.ts
import path2 from "path";
import { execa } from "execa";
import fs2 from "fs-extra";
import pc from "picocolors";

// src/constants/baseDeps.ts
var baseDevDeps = ["nodemon"];
var baseDeps = ["cookie-parser", "cors", "dotenv", "express", "zod"];

// src/generator/copyAndRender.ts
import path from "path";
import fs from "fs-extra";
import Handlebars from "handlebars";
import { glob } from "tinyglobby";
async function copyAndRenderTemplate(templatePath, targetPath, context) {
  await fs.copy(templatePath, targetPath);
  const files = await glob("**/*.hbs", {
    cwd: targetPath,
    absolute: true,
    dot: true
  });
  await Promise.all(
    files.map(async (filePath) => {
      try {
        const templateContent = await fs.readFile(filePath, "utf-8");
        const compiled = Handlebars.compile(templateContent);
        const rendered = compiled(context);
        let outputPath = filePath.replace(/\.hbs$/, "");
        if (context.ts && outputPath.endsWith(".js")) {
          outputPath = outputPath.replace(/\.js$/, ".ts");
        }
        await fs.ensureDir(path.dirname(outputPath));
        await fs.writeFile(outputPath, rendered, "utf-8");
        await fs.remove(filePath);
      } catch (err) {
        console.error(`\u274C Failed to render template: ${filePath}`, err);
        throw err;
      }
    })
  );
}

// src/generator/index.ts
async function generateProject(config) {
  const projectRoot = path2.resolve(process.cwd(), config.name);
  const context = {
    ...config,
    ts: config.language === "ts"
  };
  const baseDir = path2.resolve(`src/templates/base`);
  await copyAndRenderTemplate(baseDir, projectRoot, context);
  const selectedFeatures = selectFeatures(context);
  const allDependencies = baseDeps;
  const allDevDependencies = baseDevDeps;
  if (context.ts) allDependencies.push("tsx", "typescript");
  if (context.ts)
    allDevDependencies.push(
      "@types/cookie-parser",
      "@types/express",
      "@types/jsonwebtoken",
      "@types/node"
    );
  console.log(selectedFeatures);
  for (const featureName of selectedFeatures) {
    const featurePath = path2.resolve(`src/templates/features/${featureName}`);
    const featureJsonPath = path2.join(featurePath, "feature.json");
    if (!await fs2.pathExists(featureJsonPath)) continue;
    const featureConfig = await fs2.readJSON(featureJsonPath);
    const destination = featureConfig.destination ?? "src";
    const targetPath = path2.join(projectRoot, destination);
    await copyAndRenderTemplate(featurePath, targetPath, context);
    if (featureConfig.dependencies)
      allDependencies.push(...featureConfig.dependencies);
    if (featureConfig.conditionalDependencies && config.dbType) {
      const conditional = featureConfig.conditionalDependencies[config.dbType];
      if (conditional) allDependencies.push(...conditional);
    }
  }
  console.log(
    pc.cyan(
      `Installing ${allDependencies.length} dependencies and ${allDevDependencies.length} dev dependencies`
    )
  );
  if (allDependencies.length > 0) {
    try {
      await execa("npm", ["install", ...allDependencies], {
        cwd: projectRoot,
        stdio: "pipe"
      });
    } catch (err) {
      pc.red(`Install failed: ${err.stderr}`);
    }
  }
  if (allDevDependencies.length > 0) {
    try {
      await execa("npm", ["install", "--save-dev", ...allDevDependencies], {
        cwd: projectRoot,
        stdio: "pipe"
      });
    } catch (err) {
      pc.red(`Install failed: ${err.stderr}`);
    }
  }
  console.log(`\u2705 Project "${config.name}" generated successfully!`);
}
var selectFeatures = (config) => {
  const selectedFeatures = [];
  if (config.prebuiltAuth) selectedFeatures.push("auth");
  if (config.useSocket) selectedFeatures.push("socket");
  if (config.useDatabase) {
    const feature = "db";
    let path3 = null;
    if (config.dbType === "PostgreSQL") path3 = `${feature}/prisma`;
    if (config.dbType === "MySQL") path3 = `${feature}/sequelize`;
    selectedFeatures.push(path3);
  }
  return selectedFeatures;
};

// src/prompts/projectPrompts.ts
import { confirm, isCancel, select, text } from "@clack/prompts";
import { consola } from "consola";
import { vice } from "gradient-string";
import minimist from "minimist";

// src/schema/ProjectConfigSchema.ts
import z from "zod";
var ProjectConfigSchema = z.object({
  name: z.string().min(1, "Project name cannot be empty."),
  expressVersion: z.string().optional(),
  useDatabase: z.boolean(),
  dbType: z.enum(["MongoDB", "PostgreSQL", "MySQL"]).optional(),
  dbConnectionString: z.url("Invalid database connection string.").optional(),
  dbName: z.string().min(1, "Database name cannot be empty.").optional(),
  prebuiltAuth: z.boolean(),
  useSocket: z.boolean(),
  language: z.enum(["js", "ts"])
}).superRefine((data, ctx) => {
  if (data.useDatabase) {
    if (!data.dbType) {
      ctx.addIssue({
        path: ["dbType"],
        message: "Database type is required when using a database.",
        code: "custom"
      });
    }
    if (!data.dbConnectionString) {
      ctx.addIssue({
        path: ["dbConnectionString"],
        message: "Connection string required.",
        code: "custom"
      });
    }
    if (!data.dbName) {
      ctx.addIssue({
        path: ["dbName"],
        message: "Database name is required.",
        code: "custom"
      });
    }
  }
});

// src/prompts/projectPrompts.ts
async function promptProjectConfig() {
  const args = minimist(process.argv.slice(2), {
    string: ["mode"],
    alias: { m: "mode" },
    default: { mode: "start" }
  });
  let projectName = args._[0];
  const mode = args.mode;
  const isTesting = mode === "test";
  if (!projectName) {
    const nameInput = await text({
      message: "Enter your project name:",
      placeholder: "my-app",
      initialValue: "my-app",
      validate(value) {
        if (!value) return vice("Project name cannot be empty!");
      }
    });
    if (isCancel(nameInput)) {
      consola.warn("Operation cancelled.");
      process.exit(0);
    }
    projectName = nameInput;
  }
  projectName = isTesting ? `tests/${projectName}` : projectName;
  const expressVersionInput = await text({
    message: "Enter Express version (leave empty for latest LTS):",
    placeholder: "latest",
    initialValue: "latest"
  });
  if (isCancel(expressVersionInput)) process.exit(0);
  const expressVersion = expressVersionInput || "latest";
  const language = await select({
    message: "Choose language:",
    options: [
      { value: "js", label: "JavaScript" },
      { value: "ts", label: "TypeScript" }
    ]
  });
  if (isCancel(language)) process.exit(0);
  const useDatabase = await confirm({
    message: "Do you want to use a database?",
    initialValue: false
  });
  if (isCancel(useDatabase)) process.exit(0);
  let dbType;
  let dbConnectionString;
  let dbName;
  let prebuiltAuth;
  if (useDatabase) {
    const dbTypeSelection = await select({
      message: "Select a database:",
      options: [
        { value: "MongoDB", label: "MongoDB" },
        { value: "PostgreSQL", label: "PostgreSQL" },
        { value: "MySQL", label: "MySQL" }
      ]
    });
    if (isCancel(dbTypeSelection)) process.exit(0);
    dbType = dbTypeSelection;
    const defaults = {
      MongoDB: "mongodb://localhost:27017/",
      PostgreSQL: "postgres://postgres:password@localhost:5432",
      MySQL: "mysql://root:password@localhost:3306"
    };
    const connectionInput = await text({
      message: "Enter the database connection string:",
      placeholder: defaults[dbType],
      initialValue: defaults[dbType]
    });
    if (isCancel(connectionInput)) process.exit(0);
    dbConnectionString = connectionInput;
    const dbNameInput = await text({
      message: "Enter the database name:",
      placeholder: "my_database",
      initialValue: "my_database"
    });
    if (isCancel(dbNameInput)) process.exit(0);
    dbName = dbNameInput;
    const usePrebuiltAuth = await confirm({
      message: "Do you want to use pre built auth?",
      initialValue: true
    });
    if (isCancel(usePrebuiltAuth)) process.exit(0);
    prebuiltAuth = usePrebuiltAuth;
  }
  const useSocket = await confirm({
    message: "Do you want to use Socket.io?",
    initialValue: false
  });
  if (isCancel(useSocket)) process.exit(0);
  const normalizeProjectName = (n) => n === "." ? "" : n;
  const normalizedProjectName = normalizeProjectName(projectName);
  const rawConfig = {
    name: normalizedProjectName,
    expressVersion,
    useDatabase,
    dbType,
    dbConnectionString,
    dbName,
    prebuiltAuth,
    useSocket,
    language
  };
  const result = ProjectConfigSchema.safeParse(rawConfig);
  if (!result.success) {
    consola.error("\u274C Invalid configuration:");
    for (const issue of result.error.issues) {
      consola.error(`\u2192 ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }
  return result.data;
}

// src/index.ts
async function main() {
  consola2.box(teen("\u{1F680} Welcome to Initex CLI"));
  intro(pc2.italic(pc2.cyan("Let's initialize your new project!")));
  const config = await promptProjectConfig();
  await generateProject(config);
  log.success(`${pc2.bold(pc2.cyan("Project ready:"))} ${config.name}`);
  log.info(`Next steps:
${pc2.gray(`cd ${config.name} && npm install`)}`);
  outro(
    `Project ${pc2.bold(pc2.cyan(config.name))} created with express version ${config.expressVersion}`
  );
  return config;
}
main().catch((err) => {
  consola2.error("\u{1F4A5} Unexpected error:", err);
  process.exit(1);
});
