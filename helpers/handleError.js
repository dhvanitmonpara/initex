import fs from 'fs'
import inquirer from 'inquirer';

export async function handleError(error, answers) {
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