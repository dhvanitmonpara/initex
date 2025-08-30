import fs from 'fs'

async function updatePackageJsonScripts(answers, rooFolder) {
  const pkgPath = `${rooFolder}/package.json`
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  if (answers.useTypeScript) {
    pkg.scripts = {
      ...pkg.scripts,
      build: answers.useTypeScript ? "tsc" : "",
      start: "node dist/index.js",
      dev: "tsx src/index.ts"
    };
    pkg.main = "dist/index.js";
  } else {
    pkg.scripts = {
      ...pkg.scripts,
      start: "node index.js",
    };
    pkg.scripts.dev = "nodemon index.js";
  }
  pkg.type = "module";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
}

export { updatePackageJsonScripts }