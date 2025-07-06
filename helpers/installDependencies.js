import { execSync } from 'child_process';
import path from 'path'
import { ensureDir } from '../utils/file.js';

export async function installDependencies(answers) {
  try {
    const baseFolder = path.join(process.cwd(), answers.projectName);
    ensureDir(baseFolder);
  
    const execOptions = { stdio: "inherit", cwd: baseFolder };
  
    console.log("\n📦 Installing dependencies...");
    await execSync("npm init -y", execOptions);
  
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
  
    await execSync(`npm install ${dependencies.join(" ")}`, execOptions);
    if (devDependencies.length > 0) {
      await execSync(`npm install --save-dev ${devDependencies.join(" ")}`, execOptions);
    }
  } catch (error) {
    throw error
  }
}