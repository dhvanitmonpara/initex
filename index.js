#!/usr/bin/env node

import inquirer from "inquirer";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// ----------------------
// Utility Functions
// ----------------------
const createFile = (filePath, content) => {
  const dir = path.dirname(filePath);

  // Ensure directory exists before writing the file
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true }); // Create directory recursively if it doesn't exist
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Created ${filePath}`);
};


function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory ${dirPath}`);
  }
}

function getExtension(answers) {
  return answers.useTypeScript ? "ts" : "js";
}

// ----------------------
// Package JSON Updater
// ----------------------
async function updatePackageJsonScripts(answers, baseFolder) {
  const pkgPath = "./package.json";
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  if (answers.useTypeScript) {
    pkg.scripts = {
      ...pkg.scripts,
      build: "tsc",
      start: "node dist/index.js",
    };
    if (answers.setupNodemon) {
      pkg.scripts.dev = "nodemon --watch 'src/**/*.ts' --exec ts-node src/index.ts";
    }
  } else {
    pkg.scripts = {
      ...pkg.scripts,
      start: "node index.js",
    };
    if (answers.setupNodemon) {
      pkg.scripts.dev = "nodemon index.js";
    }
    pkg.type = "module"; // ensure ESM
  }
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
  console.log("Updated package.json scripts.");
}

// ----------------------
// Constants File Creator
// ----------------------
function createConstantsFile(answers, baseFolder) {
  const ext = getExtension(answers);
  const fileName = path.join(baseFolder, `constants.${ext}`);
  if (!fs.existsSync(fileName)) {
    const dbName = answers.dbName ? answers.dbName : '"db-name"';
    const content = `const DB_NAME = '${dbName}';\nconst appName = "AppName";\n\nexport { DB_NAME, appName };\n`;
    createFile(fileName, content);
  }
}

// ----------------------
// Content Generators
// ----------------------
function generateAppContent(answers) {
  const isTS = answers.useTypeScript;
  let content = "";
  if (isTS) {
    if (answers.useSocket) {
      content = `
import express from 'express';
import { Server } from 'socket.io';
import routes from './routes/healthRoute';
import cors from "cors";
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ACCESS_CONTROL_ORIGIN,
    methods: ["GET", "POST"],
  },
});
const corsOptions = {
  origin: process.env.ACCESS_CONTROL_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.options('*', cors());
app.use('/', routes);

io.on('connection', (socket) => {
  // define your function
});

// routes
import healthRouter from "./routes/healthRoute"

app.use("/api/v1/users", healthRouter)

export default app;
      `.trim();
    } else {
      content = `
import express from 'express';
import routes from './routes/healthRoute';
import cors from "cors";

const app = express();
const corsOptions = {
  origin: process.env.ACCESS_CONTROL_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.options('*', cors());
app.use('/', routes);

// routes
import healthRouter from "./routes/healthRoute"

app.use("/api/v1/users", healthRouter)

export default app;
      `.trim();
    }
  } else {
    if (answers.useSocket) {
      content = `
import express from 'express';
import { Server } from 'socket.io';
import routes from './routes/healthRoute.js';
import cors from "cors";
import http from 'http';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.ACCESS_CONTROL_ORIGIN,
    methods: ["GET", "POST"],
  },
});
const corsOptions = {
  origin: process.env.ACCESS_CONTROL_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.options('*', cors());
app.use('/', routes);

io.on('connection', (socket) => {
  // define your function
});

// routes
import healthRouter from "./routes/healthRoute.js"

app.use("/api/v1/users", healthRouter)

export default app;
      `.trim();
    } else {
      content = `
import express from 'express';
import routes from './routes/healthRoute.js';
import cors from "cors";

const app = express();
const corsOptions = {
  origin: process.env.ACCESS_CONTROL_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.options('*', cors());
app.use('/', routes);

// routes
import healthRouter from "./routes/healthRoute.js"

app.use("/api/v1/users", healthRouter)

export default app;
      `.trim();
    }
  }
  return content;
}

function generateMainContent(answers) {
  const isTS = answers.useTypeScript;
  if (answers.useDatabase) {
    return isTS
      ? `
import connectDB from "./db/index";
import dotenv from "dotenv";
import app from "./app";

const port = process.env.PORT || 8000;
dotenv.config({ path: './.env' });

connectDB().then(() => {
  app.listen(port, () => {
    console.log(\`Server is listening to port \${port}\`);
  });
  app.on("error", (error) => {
    console.log("ERROR: ", error);
    throw error;
  });
}).catch((error) => {
  console.log("MongoDB connection failed: ", error);
});
      `.trim()
      : `
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";

const port = process.env.PORT || 8000;
dotenv.config({ path: './.env' });

connectDB().then(() => {
  app.listen(port, () => console.log(\`Server running on port \${port}\`));
}).catch((error) => {
  console.log("MongoDB connection failed: ", error);
});
      `.trim();
  } else {
    return isTS
      ? `
import dotenv from "dotenv";
import app from "./app";

const port = process.env.PORT || 8000;
dotenv.config({ path: './.env' });

app.listen(port, () => {
  console.log(\`Server is listening to port \${port}\`);
});
      `.trim()
      : `
import dotenv from "dotenv";
import app from "./app.js";

const port = process.env.PORT || 8000;
dotenv.config({ path: './.env' });

app.listen(port, () => console.log(\`Server running on port \${port}\`));
      `.trim();
  }
}

function generateRoutesContent(answers) {
  return answers.useTypeScript
    ? `
import { Router } from 'express';
import { healthCheck } from '../controllers/healthController';

const router = Router();
router.get('/', healthCheck);

export default router;
    `.trim()
    : `
import { Router } from 'express';
import { healthCheck } from '../controllers/healthController.js';

const router = Router();
router.get('/', healthCheck);

export default router;
    `.trim();
}

function generateControllerContent(answers) {
  return answers.useTypeScript
    ? `
import { Request, Response, NextFunction } from "express";
import { ApiResponse, AsyncHandler } from "../utils/ApiHelpers";

const healthCheck = AsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json(new ApiResponse(200, {}, "Server is healthy"));
  }
);

export { healthCheck };
    `.trim()
    : `
import { ApiResponse, AsyncHandler } from "../utils/ApiHelpers.js";

const healthCheck = AsyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, {}, "Server is healthy"));
});

export { healthCheck };
    `.trim();
}

function generateApiHelpersContent(answers) {
  return answers.useTypeScript
    ? `
import { Request, Response, NextFunction } from "express";

export class ApiError extends Error {
  statusCode: number;
  data: any;
  success: boolean;
  errors: any[];

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: any[] = [],
    stack: string = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class ApiResponse {
  statusCode: number;
  data: any;
  message: string;
  success: boolean;

  constructor(statusCode: number, data: any, message: string = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export const AsyncHandler = (
  requestHandler: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      return await requestHandler(req, res, next);
    } catch (error: any) {
      res.status(error.code || 500).json({
        success: false,
        message: error.message,
      });
    }
  };
};
    `.trim()
    : `
class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class ApiResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

const AsyncHandler = (requestHandler) => async (req, res, next) => {
  try {
    return await requestHandler(req, res, next);
  } catch (error) {
    res.status(error.code || 500).json({
      success: false,
      message: error.message,
    });
  }
};

export { ApiError, ApiResponse, AsyncHandler };
    `.trim();
}

function generateDbConnectionContent(answers) {
  switch (answers.dbType) {
    case "MongoDB":
      return answers.useTypeScript
        ? `
import mongoose from "mongoose";
import { DB_NAME } from "../constants";

const connectDB = async () => {
  try {
    const connectionString = process.env.ENVIRONMENT === "production" 
      ? \`\${process.env.MONGODB_URI}/\${DB_NAME}\` 
      : process.env.MONGODB_URI;
    if (!connectionString) throw new Error("MONGODB_URI is not set");
    await mongoose.connect(connectionString);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
    `.trim()
        : `
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionString = process.env.ENVIRONMENT === "production"
      ? \`\${process.env.MONGODB_URI}/\${DB_NAME}\`
      : process.env.MONGODB_URI;
    if (!connectionString) throw new Error("MONGODB_URI is not set");
    await mongoose.connect(connectionString);
    console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
    `.trim();
    case "PostgreSQL":
      return `
import { Pool } from 'pg';
import { DB_NAME } from '../constants';

const connectDB = async () => {
  try {
    // Construct the connection string. In production, you might append the DB_NAME.
    const connectionString = process.env.ENVIRONMENT === 'production'
      ? \`\${process.env.POSTGRES_URI}/\${DB_NAME}\`
      : process.env.POSTGRES_URI;

    if (!connectionString) {
      throw new Error("POSTGRES_URI is not set");
    }

    const pool = new Pool({ connectionString });

    // Test the connection by running a simple query.
    await pool.query('SELECT NOW()');
    console.log("PostgreSQL connected");

    return pool;
  } catch (error) {
    console.error("PostgreSQL connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
    `.trim();
    case "MySQL":
      return `
import mysql from 'mysql2/promise';
import { DB_NAME } from '../constants';

const connectDB = async () => {
  try {
    // Create a configuration object using environment variables.
    const connectionConfig = {
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.ENVIRONMENT === 'production'
        ? DB_NAME
        : process.env.MYSQL_DATABASE,
    };

    // Validate that essential connection info is provided.
    if (!connectionConfig.host || !connectionConfig.user || !connectionConfig.database) {
      throw new Error("MySQL connection configuration is not fully set");
    }

    const connection = await mysql.createConnection(connectionConfig);
    console.log("MySQL connected");

    return connection;
  } catch (error) {
    console.error("MySQL connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
      `.trim();
  }
}

function generateSequelizeContent(answers) {
  return `
const { Sequelize } = require('sequelize');

const dialect = process.env.DB_TYPE === 'mysql' ? 'mysql' : 'postgres';
const connectionString = process.env[ dialect === 'mysql' ? 'MYSQL_URI' : 'POSTGRES_URI' ];

if (!connectionString) {
  throw new Error('Database connection URI is not set');
}

const sequelize = new Sequelize(connectionString, {
  dialect, // 'mysql' or 'postgres'
  // add extra options as needed
});

module.exports = sequelize;
  `.trim()
}

function generateModelContent(answers) {
  if (answers.dbType === "MongoDB") {
    return answers.useTypeScript
      ? `
import mongoose from 'mongoose';

const sampleSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

export default mongoose.model('Sample', sampleSchema);
    `.trim()
      : `
const mongoose = require('mongoose');

const sampleSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

module.exports = mongoose.model('Sample', sampleSchema);
    `.trim();
  } else {
    return `
import { DataTypes } from 'sequelize';
import sequelize from '../db/sequelize';

const Sample = sequelize.define('Sample', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Sample;
      `.trim()
  }
}

// ----------------------
// Create Project Structure
// ----------------------
async function createProjectFiles(answers) {
  const baseFolder = answers.useTypeScript ? "src" : ".";
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
    if (!fs.existsSync("tsconfig.json")) {
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
      createFile("tsconfig.json", JSON.stringify(tsconfig, null, 2));
    }
  } else {
    createFile("index.js", mainContent);
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
  createFile(".gitignore", "node_modules/\ndist/\n.env");

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
    createFile(".env", envContent);
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
    createFile("README.md", readmeContent);
  }

  // ecosystem.config.js for PM2
  if (answers.setupPM2) {
    const ecosystemContent = answers.useTypeScript
      ? `
  module.exports = {
    apps: [
      {
        name: 'app',
        script: 'dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
    },
  ],
};
      `.trim()
      : `
    module.exports = {
      apps: [
        {
          name: 'app',
      script: 'index.js',
      instances: 'max',
      exec_mode: 'cluster',
      },
  ],
};
      `.trim();
    createFile("ecosystem.config.js", ecosystemContent);
  }

  // Dockerfile
  if (answers.setupDocker) {
    const dockerfileContent = answers.useTypeScript
      ? `
# Build stage
FROM node:16 as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npx tsc

# Production stage
FROM node:16
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
EXPOSE 8000
CMD ["node", "dist/index.js"]
      `.trim()
      : `
      FROM node:16
      WORKDIR /app
      COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8000
CMD ["node", "index.js"]
      `.trim();
    createFile("Dockerfile", dockerfileContent);
  }

  await updatePackageJsonScripts(answers, baseFolder);
}

// ----------------------
// Main Setup Function
// ----------------------
async function setupProject() {
  console.log("\n🚀 Setting up your Express project...\n");

  const answers = await inquirer.prompt([
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
      default: "mongodb://localhost:27017",
      when: (answers) => answers.useDatabase && answers.dbType === "MongoDB",
    },
    {
      type: "input",
      name: "dbConnectionString",
      message: "Enter the database connection string:",
      default: "postgres://postgres:password@localhost:5432",
      when: (answers) => answers.useDatabase && answers.dbType === "PostgreSQL",
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
      name: "setupPM2",
      message: "Do you want to set up PM2 for process management?",
      default: false,
    },
    {
      type: "confirm",
      name: "setupDocker",
      message: "Do you want to set up a Dockerfile for deployment?",
      default: false,
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
  ]);

  console.log("\n📦 Installing dependencies...");

  try {
    execSync("npm init -y", { stdio: "inherit" });

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
    if (answers.setupPM2) dependencies.push("pm2");

    execSync(`npm install ${dependencies.join(" ")}`, { stdio: "inherit" });
    if (devDependencies.length > 0) {
      execSync(`npm install --save-dev ${devDependencies.join(" ")}`, { stdio: "inherit" });
    }

    console.log("\n✅ Installation complete!");
    console.log("\n🗂 Creating project structure and files...");
    await createProjectFiles(answers);
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
