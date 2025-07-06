import fs from "fs";
import path from "path";

/**
 * Create a file at given path with given content.
 * Creates parent folders recursively if needed.
 */
function createFile(filePath, content) {
  const dir = path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`✅ Created file: ${filePath}`);
}

/**
 * Read a file synchronously and return its content as string.
 * Throws if file does not exist.
 */
function readFileContent(filePath) {
  const absolutePath = path.resolve(filePath);

  try {
    return fs.readFileSync(absolutePath, "utf8").trim();
  } catch (err) {
    throw new Error(`❌ Failed to read file at "${absolutePath}": ${err.message}`);
  }
}

/**
 * Resolves file content only if it exists. Returns empty string otherwise.
 * Does not create any directory (unlike your old code).
 */
function extractFileContent(filePath) {
  const absolutePath = path.resolve(filePath);

  if (!fs.existsSync(absolutePath)) {
    console.warn(`⚠️ File not found: ${absolutePath}`);
    return "";
  }

  return readFileContent(absolutePath);
}

/**
 * Ensures a directory exists — creates it recursively if needed.
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dirPath}`);
  }
}

/**
 * Utility to get file extension based on project type.
 */
function getExtension(answers) {
  return answers.useTypeScript ? "ts" : "js";
}

export {
  createFile,
  readFileContent,
  extractFileContent,
  ensureDir,
  getExtension
};
