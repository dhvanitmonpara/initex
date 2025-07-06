import { getExtension, createFile } from "../utils/file.js"
import fs from 'fs'
import path from 'path'

function createConstantsFile(answers, baseFolder) {
  const ext = getExtension(answers);
  const fileName = path.join(baseFolder, `constants.${ext}`);
  if (!fs.existsSync(fileName)) {
    const dbName = answers.dbName ? answers.dbName : '"db-name"';
    const content = `const DB_NAME = '${dbName}';\nconst appName = "AppName";\n\nexport { DB_NAME, appName };\n`;
    createFile(fileName, content);
  }
}

export { createConstantsFile }
