import path from "node:path";
import fs from "fs-extra";
import Handlebars from "handlebars";
import { glob } from "tinyglobby";
import type { ProjectContext } from "@/schemas/ProjectConfigSchema";

export async function copyAndRenderTemplate(
  templatePath: string,
  targetPath: string,
  context: ProjectContext
) {
  await fs.copy(templatePath, targetPath, {
    filter: (src) => {
      try {
        const base = path.basename(src);
        if (base === "addon.json") return false;
        return true;
      } catch (_) {
        return true;
      }
    },
  });

  const files = await glob("**/*.hbs", {
    cwd: targetPath,
    absolute: true,
    dot: true,
    ignore: ["addon.json", "**/addon.json"],
  });

  await Promise.all(
    files.map(async (filePath) => {
      try {
        const templateContent = await fs.readFile(filePath, "utf-8");
        const compiled = Handlebars.compile(templateContent);
        const rendered = compiled(context);

        const outputPath = filePath.replace(/\.hbs$/, "");

        await fs.ensureDir(path.dirname(outputPath));
        await fs.writeFile(outputPath, rendered, "utf-8");
        await fs.remove(filePath);
      } catch (err) {
        console.error(`❌ Failed to render template: ${filePath}`, err);
        throw err;
      }
    })
  );
}
