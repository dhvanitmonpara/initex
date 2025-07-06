import fs from 'fs';
import path from 'path';

export function cleatDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Path "${dirPath}" does not exist.`);
  }

  const files = fs.readdirSync(dirPath);

  if(files.length === 0) {
    return;
  }
  
  console.log("\n🗑️ Clearing directory...");
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.lstatSync(fullPath);

    try {
      if (stat.isDirectory()) {
        fs.rmSync(fullPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(fullPath);
      }
    } catch (err) {
      console.error(`Failed to delete ${fullPath}:`, err.message);
    }
  }
}
