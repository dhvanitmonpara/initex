import fs from "fs";
import path from "path";
import { createConstantsFile } from '../generators/constantFile.js'
import { generateApiHelpersContent, generateAppContent, generateControllerContent, generateDbConnectionContent, generateEnvConfig, generateMainContent, generateModelContent, generateRoutesContent, generateSequelizeContent } from '../generators/contentGenerators.js'
import { updatePackageJsonScripts } from "../generators/packageJson.js"
import { createFile, ensureDir } from "../utils/file.js"

export async function createProjectFiles(answers) {
  const baseFolder = answers.useTypeScript ? `./${answers.projectName}/src` : `./${answers.projectName}`;
  const rooFolder = `./${answers.projectName}`
  ensureDir(baseFolder);

  if (answers.useDatabase && answers.dbType === "MongoDB") {
    ensureDir(path.join(baseFolder, "db"));
  }
  ensureDir(path.join(baseFolder, "utils"));

  // Create files
  // app file
  const appContent = generateAppContent(answers);
  if (answers.useTypeScript) {
    createFile(path.join(baseFolder, "app.ts"), appContent);
  } else {
    createFile(path.join(baseFolder, "app.js"), appContent);
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
    createFile(path.join(baseFolder, "routes", "health.route.ts"), routesContent);
  } else {
    createFile(path.join(baseFolder, "routes", "health.route.js"), routesContent);
  }

  // controller file
  const controllerContent = generateControllerContent(answers);
  if (answers.useTypeScript) {
    createFile(path.join(baseFolder, "controllers", "health.controller.ts"), controllerContent);
  } else {
    createFile(path.join(baseFolder, "controllers", "health.controller.js"), controllerContent);
  }

  // utils/ApiHelpers file
  const apiHelpersContent = generateApiHelpersContent(answers);
  if (answers.useTypeScript) {
    createFile(path.join(baseFolder, "utils", "ApiHelpers.ts"), apiHelpersContent);
  } else {
    createFile(path.join(baseFolder, "utils", "ApiHelpers.js"), apiHelpersContent);
  }

  // constants file
  createConstantsFile(answers, baseFolder);

  // Database files
  if (answers.useDatabase) {
    if (answers.dbType === "MongoDB") {
      const modelContent = generateModelContent(answers);
      const dbConnContent = generateDbConnectionContent(answers);
      if (answers.useTypeScript) {
        createFile(path.join(baseFolder, "models", "sample.model.ts"), modelContent);
        createFile(path.join(baseFolder, "db", "index.ts"), dbConnContent);
      } else {
        createFile(path.join(baseFolder, "models", "sample.model.js"), modelContent);
        createFile(path.join(baseFolder, "db", "index.js"), dbConnContent);
      }
    } else {
      const modelContent = generateModelContent(answers);
      const dbConnContent = generateDbConnectionContent(answers);
      const sequelizeContent = generateSequelizeContent(answers);
      if (answers.useTypeScript) {
        createFile(path.join(baseFolder, "models", "sample.model.ts"), modelContent);
        createFile(path.join(baseFolder, "db", "index.ts"), dbConnContent);
        createFile(path.join(baseFolder, "db", "sequelize.ts"), sequelizeContent);
      } else {
        createFile(path.join(baseFolder, "models", "sample.model.js"), modelContent);
        createFile(path.join(baseFolder, "db", "index.js"), dbConnContent);
        createFile(path.join(baseFolder, "db", "sequelize.js"), sequelizeContent);
      }
    }
  }
  // Ensure constants file exists
  createConstantsFile(answers, baseFolder);

  // .gitignore
  createFile(path.join(rooFolder, ".gitignore"), "node_modules/\ndist/\n.env\n/src/generated/prisma");

  // .env file
  if (answers.createEnv) {
    let envContent = "";
    if (answers.dbType === "MongoDB") {
      envContent = `PORT=8000\nMONGODB_URI=${answers.dbConnectionString || "your_db_connection_string"}\nENVIRONMENT=development\nHTTP_SECURE_OPTION=true\nACCESS_CONTROL_ORIGIN=http://localhost:5173`
    } else if (answers.dbType === "PostgreSQL") {
      envContent = `PORT=8000\nPOSTGRES_URI=${answers.dbConnectionString || "your_db_connection_string"}\nDB_TYPE=postgres\nENVIRONMENT=development\nHTTP_SECURE_OPTION=true\nACCESS_CONTROL_ORIGIN=http://localhost:5173`
    } else {
      envContent = `PORT=8000\nMYSQL_HOST=${answers.mysqlHost || "your_mysql_host"}\nMYSQL_USER=${answers.mysqlUser || "your_mysql_user"}\nMYSQL_PASSWORD=${answers.mysqlPassword || "your_mysql_password"}\nMYSQL_DATABASE=${answers.dbName || "your_db_name"}\nDB_TYPE=mysql\nENVIRONMENT=development\nHTTP_SECURE_OPTION=true\nACCESS_CONTROL_ORIGIN=http://localhost:5173`
    }
    createFile(path.join(rooFolder, ".env"), envContent);

    const envConfigContent = generateEnvConfig(answers)
    createFile(path.join(baseFolder, "conf", answers.useTypeScript ? "env.ts" : "env.js"), envConfigContent);
  }

  // README.md
  if (answers.createReadme) {
    const readmeContent = `# Express Project

This project was generated using the Express Setup Script.

## Available Scripts

- \`npm start\`: Runs the app.
- \`npm run dev\`: Runs the app in development mode with nodemon.\n"
${answers.useTypeScript ? "- \`npm run build\`: Builds the TypeScript code.\n" : ""}
`;
    createFile(path.join(rooFolder, "README.md"), readmeContent);
  }

  await updatePackageJsonScripts(answers, rooFolder);
  console.log("\n✅ Project setup complete!");
}