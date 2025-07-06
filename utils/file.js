import fs from "fs";
import path from "path";

const createFile = (filePath, content) => {
  const dir = path.dirname(filePath);

  // Ensure directory exists before writing the file
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true }); // Create directory recursively if it doesn't exist
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Created ${filePath}`);
};

function readFileContent(filePath) {
  return new Promise((resolve, reject) => {
    const absolutePath = path.resolve(filePath);

    fs.readFile(absolutePath, 'utf8', (err, data) => {
      if (err) {
        return reject(new Error(`Failed to read file at "${absolutePath}": ${err.message}`));
      }
      resolve(data);
    });
  });
}

function extractFileContent(filePath) {
  if (ensureDir(path.dirname(filePath))) {
    return readFileContent(filePath);
  } else {
    return "";
  }
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created ${dirPath}`);
  }
}

function getExtension(answers) {
  return answers.useTypeScript ? "ts" : "js";
}

export {
  createFile,
  readFileContent,
  extractFileContent,
  getExtension,
  ensureDir
}