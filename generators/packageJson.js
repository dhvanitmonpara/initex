import { getExtension } from "../utils/file.js"
import fs from 'fs'

async function updatePackageJsonScripts(answers, baseFolder) {
  const pkgPath = baseFolder ? `./${baseFolder}/package.json` : './package.json';
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
}

export { updatePackageJsonScripts }