import { extractFileContent } from '../utils/file.js'

function getPath(template, variant){
  return `../templates/${template}/${variant}`
}

function generateAppContent(answers) {
  const isTS = answers.useTypeScript;
  if (isTS) {
    if (answers.useSocket) {
      return extractFileContent(getPath("app", "ts-socket.ts")).trim();
    } else {
      return extractFileContent(getPath("app", "ts-boiler.ts")).trim();
    }
  } else {
    if (answers.useSocket) {
      return extractFileContent(getPath("app", "js-socket.js")).trim();
    } else {
      return extractFileContent(getPath("app", "js-boiler.js")).trim();
    }
  }
}

function generateMainContent(answers) {
  const isTS = answers.useTypeScript;
  if (answers.useDatabase) {
    return isTS
      ? extractFileContent(getPath("main", "ts-db.ts")).trim()
      : extractFileContent(getPath("main", "js-db.js")).trim();
  } else {
    return isTS
      ? extractFileContent(getPath("main", "ts-boiler.ts")).trim()
      : extractFileContent(getPath("main", "js-boiler.js")).trim()
  }
}

function generateRoutesContent(answers) {
  return answers.useTypeScript
    ? extractFileContent(getPath("routes", "ts.ts")).trim()
    : extractFileContent(getPath("routes", "js.js")).trim()
}

function generateControllerContent(answers) {
  return answers.useTypeScript
    ? extractFileContent(getPath("controllers", "ts.ts")).trim()
    : extractFileContent(getPath("controllers", "js.js")).trim()
}

function generateApiHelpersContent(answers) {
  return answers.useTypeScript
    ? extractFileContent(getPath("apiHelpers", "ts.ts")).trim()
    : extractFileContent(getPath("apiHelpers", "js.js")).trim()
}

function generateDbConnectionContent(answers) {
  switch (answers.dbType) {
    case "MongoDB":
      return answers.useTypeScript
        ? extractFileContent(getPath("db", "mongodb-ts.ts")).trim()
        : extractFileContent(getPath("db", "mongodb-js.js")).trim()
    case "PostgreSQL":
      return extractFileContent(getPath("db", "postgres.js")).trim()
    case "MySQL":
      return extractFileContent(getPath("db", "sql.js")).trim()
  }
}

function generateSequelizeContent() {
  return extractFileContent(getPath("db", "sequelize.js")).trim()
}

function generateModelContent(answers) {
  if (answers.dbType === "MongoDB") {
    return answers.useTypeScript
      ? extractFileContent(getPath("models", "mongodb-ts.ts")).trim()
      : extractFileContent(getPath("models", "mongodb-js.js")).trim()
  } else {
    return extractFileContent(getPath("models", "sql-js.js")).trim()
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