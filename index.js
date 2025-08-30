#!/usr/bin/env node

import { clearDirectory } from "./helpers/clearDir.js";
import { createProjectFiles } from "./helpers/createProjectFiles.js";
import { handleError } from "./helpers/handleError.js";
import { installDependencies } from "./helpers/installDependencies.js";
import { promptUser } from "./helpers/promptUser.js";

async function setupProject() {
  console.log("\n🚀 Setting up your Express project...\n");

  const answers = await promptUser();

  try {

    if (!answers.projectName) await clearDirectory(".")

    await installDependencies(answers)

    console.log("✅ Installation complete!");
    console.log("\n🗂 Creating project structure and files...");

    await createProjectFiles(answers);

  } catch (error) {
    handleError(error, answers)
  }
}

setupProject();
