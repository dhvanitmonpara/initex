import { extractFileContent } from '../utils/file.js'
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getTemplatePath(template, variant) {
  return path.join(__dirname, "../templates", template, variant);
}

function generateAppContent(answers) {
  const isTS = answers.useTypeScript;
  if (isTS) {
    if (answers.useSocket) {
      return extractFileContent(getTemplatePath("app", "ts-socket.ts")).trim();
    } else {
      return extractFileContent(getTemplatePath("app", "ts-boiler.ts")).trim();
    }
  } else {
    if (answers.useSocket) {
      return extractFileContent(getTemplatePath("app", "js-socket.js")).trim();
    } else {
      return extractFileContent(getTemplatePath("app", "js-boiler.js")).trim();
    }
  }
}

function generateMainContent(answers) {
  const isTS = answers.useTypeScript;
  if (answers.useDatabase) {
    return isTS
      ? extractFileContent(getTemplatePath("main", "ts-db.ts")).trim()
      : extractFileContent(getTemplatePath("main", "js-db.js")).trim();
  } else {
    return isTS
      ? extractFileContent(getTemplatePath("main", "ts-boiler.ts")).trim()
      : extractFileContent(getTemplatePath("main", "js-boiler.js")).trim()
  }
}

function generateRoutesContent(answers) {
  return answers.useTypeScript
    ? extractFileContent(getTemplatePath("routes", "ts.ts")).trim()
    : extractFileContent(getTemplatePath("routes", "js.js")).trim()
}

function generateControllerContent(answers) {
  return answers.useTypeScript
    ? extractFileContent(getTemplatePath("controllers", "ts.ts")).trim()
    : extractFileContent(getTemplatePath("controllers", "js.js")).trim()
}

function generateApiHelpersContent(answers) {
  return answers.useTypeScript
    ? extractFileContent(getTemplatePath("apiHelpers", "ts.ts")).trim()
    : extractFileContent(getTemplatePath("apiHelpers", "js.js")).trim()
}

function generateDbConnectionContent(answers) {
  console.log(answers.dbType)
  if (answers.dbType === "MongoDB") {
    return answers.useTypeScript
      ? extractFileContent(getTemplatePath("db", "mongodb-ts.ts")).trim()
      : extractFileContent(getTemplatePath("db", "mongodb-js.js")).trim()
  } else if (answers.dbType === "PostgreSQL" || answers.dbType === "MySQL") {
    if (answers.orm === "prisma") {
      return answers.useTypeScript
        ? extractFileContent(getTemplatePath("db", "prisma.ts")).trim()
        : extractFileContent(getTemplatePath("db", "prisma.js")).trim()
    } else if (answers.orm === "sequelize") {
      return extractFileContent(getTemplatePath("db", "sequelize.js")).trim()
    }
  }
}

function generateModelContentForMongo(answers) {
  return answers.prebuiltAuth
    ? extractFileContent(getTemplatePath("models", "auth-mongodb.js")).trim()
    : extractFileContent(getTemplatePath("models", "sample-mongodb.js")).trim()
}

function generatePrismaModelContent(answers) {
  return answers.prebuiltAuth
    ? extractFileContent(getTemplatePath("models", answers.dbType === "MySQL" ? "auth-mysql.prisma" : "auth-pg.prisma")).trim()
    : extractFileContent(getTemplatePath("models", answers.dbType === "MySQL" ? "sample-mysql.prisma" : "sample-pg.prisma")).trim()
}

function generateSequelizeModelContent(answers) {
  return answers.prebuiltAuth
    ? extractFileContent(getTemplatePath("models", "auth-sequelize.js")).trim()
    : extractFileContent(getTemplatePath("models", "sample-sequelize.js")).trim()
}

function generateEnvConfig(answers) {
  const envConfig = `import "dotenv/config";
import { z } from "zod";

const zodObject = {
  PORT: z.coerce.number().default(8000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  HTTP_SECURE_OPTION: z.string(),
  ACCESS_CONTROL_ORIGIN: z.string(),
  ${answers.dbType === "PostgreSQL" || answers.dbType === "MySQL" ? `DB_TYPE: z.enum(["postgresql", "mysql"]),` : ""}
  DATABASE_URL: z.string(),
};

const envSchema = z.object(zodObject);
export const env = envSchema.parse(process.env);
`
  return envConfig.trim();
}

export {
  generateAppContent,
  generateMainContent,
  generateRoutesContent,
  generateControllerContent,
  generateApiHelpersContent,
  generateDbConnectionContent,
  generateModelContentForMongo,
  generatePrismaModelContent,
  generateSequelizeModelContent,
  generateEnvConfig
}