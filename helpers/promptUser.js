import inquirer from "inquirer";
import minimist from "minimist";

export async function promptUser() {
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

  return {
    ...answers,
    projectName: normalizedProjectName,
  };
}