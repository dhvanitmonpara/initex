import { extractFileContent } from '../utils/file.js'
import path from "path";
import fs from "fs";
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
  switch (answers.dbType) {
    case "MongoDB":
      return answers.useTypeScript
        ? extractFileContent(getTemplatePath("db", "mongodb-ts.ts")).trim()
        : extractFileContent(getTemplatePath("db", "mongodb-js.js")).trim()
    case "PostgreSQL":
      return extractFileContent(getTemplatePath("db", "postgres.js")).trim()
    case "MySQL":
      return extractFileContent(getTemplatePath("db", "sql.js")).trim()
  }
}

function generateSequelizeContent() {
  return extractFileContent(getTemplatePath("db", "sequelize.js")).trim()
}

function generateModelContent(answers) {
  if (answers.dbType === "MongoDB") {
    return answers.useTypeScript
      ? extractFileContent(getTemplatePath("models", "mongodb-ts.ts")).trim()
      : extractFileContent(getTemplatePath("models", "mongodb-js.js")).trim()
  } else {
    return extractFileContent(getTemplatePath("models", "sql-js.js")).trim()
  }
}

export {
  generateAppContent,
  generateMainContent,
  generateRoutesContent,
  generateControllerContent,
  generateApiHelpersContent,
  generateDbConnectionContent,
  generateSequelizeContent,
  generateModelContent
}