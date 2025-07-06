#!/usr/bin/env node

import inquirer from "inquirer";
import minimist from "minimist";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { createConstantsFile } from './generators/constantFile.js'
import { generateApiHelpersContent, generateAppContent, generateControllerContent, generateDbConnectionContent, generateMainContent, generateModelContent, generateRoutesContent, generateSequelizeContent } from './generators/contentGenerators.js'
import { updatePackageJsonScripts } from "./generators/packageJson.js"
import { createFile, ensureDir } from "./utils/file.js"

async function createProjectFiles(answers) {
  const baseFolder = answers.useTypeScript ? `./${answers.projectName}/src` : `./${answers.projectName}`;
  if (answers.useTypeScript) ensureDir(baseFolder);

  // Create essential folders
  ["routes", "controllers", "models"].forEach((folder) => {
    ensureDir(path.join(baseFolder, folder));
  });
  if (answers.useDatabase && answers.dbType === "MongoDB") {
    ensureDir(path.join(baseFolder, "db"));
  }
  const utilsFolder = answers.useTypeScript ? path.join(baseFolder, "utils") : "utils";
  ensureDir(utilsFolder);

  // Create files
  // app file
  const appContent = generateAppContent(answers);
  if (answers.useTypeScript) {
    createFile(path.join(baseFolder, "app.ts"), appContent);
  } else {
    createFile("app.js", appContent);
  }

  // main file
  const mainContent = generateMainContent(answers);
  if (answers.useTypeScript) {
    createFile(path.join(baseFolder, "index.ts"), mainContent);
    if (!fs.existsSync(`./${answers.projectName}/tsconfig.json`)) {
      const tsconfig = {
        compilerOptions: {
          target: "ES6",
          module: "CommonJS",
          outDir: "dist",
          strict: true,
          esModuleInterop: true,
        },
        include: [baseFolder],
      };
      createFile(path.join(baseFolder, "tsconfig.json"), JSON.stringify(tsconfig, null, 2));
    }
  } else {
    createFile(path.join(baseFolder, "index.js"), mainContent);
  }

  // routes file
  const routesContent = generateRoutesContent(answers);
  if (answers.useTypeScript) {
    createFile(path.join(baseFolder, "routes", "healthRoute.ts"), routesContent);
  } else {
    createFile(path.join("routes", "healthRoute.js"), routesContent);
  }

  // controller file
  const controllerContent = generateControllerContent(answers);
  if (answers.useTypeScript) {
    createFile(path.join(baseFolder, "controllers", "healthController.ts"), controllerContent);
  } else {
    createFile(path.join("controllers", "healthController.js"), controllerContent);
  }

  // utils/ApiHelpers file
  const apiHelpersContent = generateApiHelpersContent(answers);
  if (answers.useTypeScript) {
    createFile(path.join(baseFolder, "utils", "ApiHelpers.ts"), apiHelpersContent);
  } else {
    createFile(path.join("utils", "ApiHelpers.js"), apiHelpersContent);
  }

  // constants file
  createConstantsFile(answers, baseFolder);

  // Database files
  if (answers.useDatabase) {
    if (answers.dbType === "MongoDB") {
      const modelContent = generateModelContent(answers);
      if (answers.useTypeScript) {
        createFile(path.join(baseFolder, "models", "sampleModel.ts"), modelContent);
        const dbConnContent = generateDbConnectionContent(answers);
        createFile(path.join(baseFolder, "db", "index.ts"), dbConnContent);
      } else {
        createFile(path.join("models", "sampleModel.js"), modelContent);
        createFile(path.join("db", "index.js"), generateDbConnectionContent(answers));
      }
    } else {
      const modelContent = generateModelContent(answers);
      if (answers.useTypeScript) {
        createFile(path.join(baseFolder, "models", "sampleModel.ts"), modelContent);
        const dbConnContent = generateDbConnectionContent(answers);
        const sequelizeContent = generateSequelizeContent(answers);
        createFile(path.join(baseFolder, "db", "index.ts"), dbConnContent);
        createFile(path.join(baseFolder, "db", "sequelize.ts"), sequelizeContent);
      } else {
        createFile(path.join("models", "sampleModel.js"), modelContent);
        createFile(path.join("db", "index.js"), generateDbConnectionContent(answers));
        createFile(path.join("db", "sequelize.js"), generateSequelizeContent(answers));
      }
    }
  }
  // Ensure constants file exists
  createConstantsFile(answers, baseFolder);

  // .gitignore
  createFile(path.join(baseFolder, ".gitignore"), "node_modules/\ndist/\n.env");

  // .env file
  if (answers.createEnv) {
    let envContent = "";
    if (answers.dbType === "MongoDB") {
      envContent = `PORT=8000\nMONGODB_URI=${answers.dbConnectionString || "your_db_connection_string"}\nENVIRONMENT=development\nHTTP_SECURE_OPTION=true\nACCESS_CONTROL_ORIGIN=http://localhost:5173`
    } else if (answers.dbType === "PostgreSQL") {
      envContent = `PORT=8000\nPOSTGRES_URI=${answers.dbConnectionString || "your_db_connection_string"}\nDB_TYPE=postgres\nENVIRONMENT=development\nHTTP_SECURE_OPTION=true\nACCESS_CONTROL_ORIGIN=http://localhost:5173`
    } else {
      envContent = `PORT=8000\nMYSQL_HOST=${answers.mysqlHost || "your_mysql_host"}\nMYSQL_USER=${answers.mysqlUser || "your_mysql_user"}\nMYSQL_PASSWORD=${answers.mysqlPassword || "your_mysql_password"}\nMYSQL_DATABASE=${answers.dbName || "your_db_name"}\nDB_TYPE=MySQL\nENVIRONMENT=development\nHTTP_SECURE_OPTION=true\nACCESS_CONTROL_ORIGIN=http://localhost:5173`
    }
    createFile(path.join(baseFolder, ".env"), envContent);
  }

  // README.md
  if (answers.createReadme) {
    const readmeContent = `# Express Project

This project was generated using the Express Setup Script.

## Available Scripts

- \`npm start\`: Runs the app.
${answers.setupNodemon ? "- \`npm run dev\`: Runs the app in development mode with nodemon.\n" : ""}
${answers.useTypeScript ? "- \`npm run build\`: Builds the TypeScript code.\n" : ""}
`;
    createFile(path.join(baseFolder, "README.md"), readmeContent);
  }

  await updatePackageJsonScripts(answers, answers.projectName);
}

// ----------------------
// Main Setup Function
// ----------------------
async function setupProject() {
  console.log("\n🚀 Setting up your Express project...\n");

  const args = minimist(process.argv.slice(2));
  const projectName = args._[0];

  const questions = []

  if (!projectName) {
    questions.push({
      type: "input",
      name: "projectName",
      message: "Enter your project name:",
      default: "my-app"
    });
  }

  questions.push(
    {
      type: "input",
      name: "expressVersion",
      message: "Enter Express version (leave empty for latest LTS):",
      default: "latest",
    },
    {
      type: "confirm",
      name: "useDatabase",
      message: "Do you want to use a database?",
      default: false,
    },
    {
      type: "list",
      name: "dbType",
      message: "Select a database:",
      choices: ["MongoDB", "PostgreSQL", "MySQL"],
      when: (answers) => answers.useDatabase,
    },
    {
      type: "input",
      name: "dbConnectionString",
      message: "Enter the database connection string:",
      when: (answers) => answers.useDatabase,
      default: (answers) => {
        const defaults = {
          MongoDB: "mongodb://localhost:27017/",
          PostgreSQL: "postgres://postgres:password@localhost:5432",
          MySQL: "mysql://root:password@localhost:3306",
        };
        return defaults[answers.dbType] || "";
      },
    },
    {
      type: "input",
      name: "dbName",
      message: "Enter the database name:",
      default: "my_database",
      when: (answers) => answers.useDatabase,
    },
    {
      type: "input",
      name: "mysqlHost",
      message: "Enter the MySQL host:",
      default: "your_mysql_host",
      when: (answers) => (answers.useDatabase && answers.dbType === "MySQL"),
    },
    {
      type: "input",
      name: "mysqlUser",
      message: "Enter the MySQL User:",
      default: "your_mysql_user",
      when: (answers) => (answers.useDatabase && answers.dbType === "MySQL"),
    },
    {
      type: "input",
      name: "mysqlPassword",
      message: "Enter the MySQL Password:",
      default: "your_mysql_password",
      when: (answers) => (answers.useDatabase && answers.dbType === "MySQL"),
    },
    {
      type: "confirm",
      name: "useSocket",
      message: "Do you want to use Socket.io?",
      default: false,
    },
    {
      type: "confirm",
      name: "useTypeScript",
      message: "Do you want to use TypeScript?",
      default: false,
    },
    {
      type: "confirm",
      name: "setupNodemon",
      message: "Do you want to set up nodemon for development?",
      default: true,
    },
    {
      type: "confirm",
      name: "createEnv",
      message: "Do you want to generate a sample .env file?",
      default: true,
    },
    {
      type: "confirm",
      name: "createReadme",
      message: "Do you want to generate a README.md file?",
      default: true,
    },
  )

  const answers = await inquirer.prompt(questions);

  const normalizeProjectName = name => name === "." ? "" : name;
  const normalizedProjectName = normalizeProjectName(projectName || answers.projectName);

  try {
    const baseFolder = path.join(process.cwd(), normalizedProjectName);
    ensureDir(baseFolder);

    const execOptions = { stdio: "inherit", cwd: baseFolder };

    console.log("\n📦 Installing dependencies...");
    execSync("npm init -y", execOptions);

    let dependencies = [`express@${answers.expressVersion}`, "dotenv", "cors"];
    let devDependencies = [];

    if (answers.useDatabase) {
      console.log(`\n📦 Installing ${answers.dbType} driver...`);
      if (answers.dbType === "MongoDB") dependencies.push("mongoose");
      if (answers.dbType === "PostgreSQL") dependencies.push("pg", "pg-hstore", "sequelize");
      if (answers.dbType === "MySQL") dependencies.push("mysql2", "sequelize");
    }

    if (answers.useSocket) dependencies.push("socket.io");
    if (answers.useTypeScript)
      devDependencies.push("typescript", "ts-node", "@types/node", "@types/express");
    if (answers.setupNodemon) devDependencies.push("nodemon");

    execSync(`npm install ${dependencies.join(" ")}`, execOptions);
    if (devDependencies.length > 0) {
      execSync(`npm install --save-dev ${devDependencies.join(" ")}`, execOptions);
    }

    console.log("\n✅ Installation complete!");
    console.log("\n🗂 Creating project structure and files...");
    const finalAnswers = {
      ...answers,
      projectName: normalizedProjectName,
    };
    await createProjectFiles(finalAnswers);
  } catch (error) {
    console.error("\n❌ Installation failed:", error.message);
    const errorAction = await inquirer.prompt([
      {
        type: "list",
        name: "errorChoice",
        message: "An error occurred. What would you like to do?",
        choices: [
          { name: "Reset current folder and restart", value: "reset" },
          { name: "Continue installation", value: "continue" },
          { name: "Exit", value: "exit" },
        ],
      },
    ]);

    if (errorAction.errorChoice === "reset") {
      console.log("\n🔄 Resetting folder...");
      fs.rmSync("node_modules", { recursive: true, force: true });
      if (fs.existsSync("package.json")) fs.unlinkSync("package.json");
      if (fs.existsSync("package-lock.json")) fs.unlinkSync("package-lock.json");
      await setupProject();
    } else if (errorAction.errorChoice === "continue") {
      console.log("\n➡️ Continuing installation...");
      await createProjectFiles(answers);
    } else {
      console.log("\n👋 Exiting setup.");
      process.exit(1);
    }
  }
}

setupProject();
