import { execSync } from 'child_process';
import path from 'path'
import { ensureDir } from '../utils/file.js';

export async function installDependencies(answers) {
  try {
    const baseFolder = path.join(process.cwd(), answers.projectName);
    console.log("\n")
    ensureDir(baseFolder);

    const execOptions = { stdio: ["inherit", "ignore", "inherit"], cwd: baseFolder };

    console.log("📦 Installing dependencies...");
    await execSync("npm init -y", execOptions);

    let dependencies = [`express@${answers.expressVersion}`, "dotenv", "cors", "jsonwebtoken", "cookie-parser", "zod"];
    let devDependencies = [];

    if (answers.useDatabase) {
      console.log(`📦 Installing ${answers.dbType} driver...`);
      if (answers.dbType === "MongoDB") dependencies.push("mongoose");
      if (answers.dbType === "PostgreSQL") dependencies.push("pg", "pg-hstore", "sequelize");
      if (answers.dbType === "MySQL") dependencies.push("mysql2", "sequelize");
    }

    if (answers.useSocket) dependencies.push("socket.io");
    if (answers.useTypeScript)
      devDependencies.push("typescript", "tsx", "@types/node", "@types/express", "@types/cookie-parser", "@types/jsonwebtoken");
    if (!answers.useTypeScript) devDependencies.push("nodemon");

    await execSync(`npm install ${dependencies.join(" ")}`, execOptions);
    if (devDependencies.length > 0) {
      await execSync(`npm install --save-dev ${devDependencies.join(" ")}`, execOptions);
    }
  } catch (error) {
    throw error
  }
}