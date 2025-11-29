import path from "node:path";
import { fileURLToPath } from "node:url";
import { log, spinner } from "@clack/prompts";
import { execa } from "execa";
import fs from "fs-extra";
import pc from "picocolors";
import { baseDeps, baseDevDeps } from "@/data/baseDeps";
import type { ProjectContext } from "@/schemas/ProjectConfigSchema";
import type { AddonConfig } from "@/types/AddonConfig";
import deleteFile from "@/utils/deleteFile";
import { copyAndRenderTemplate } from "./copyAndRender";

const handleDeps = async (
  selectedAddons: string[],
  config: ProjectContext,
  basePath: string,
  projectRoot: string,
  context: ProjectContext
) => {
  const allDependencies: string[] = baseDeps;
  const allDevDependencies: string[] = baseDevDeps;
  const commands = [];

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  for (const addonName of selectedAddons) {
    const addonPath = path.resolve(
      __dirname,
      `${basePath}templates/addons/${addonName}`
    );
    const addonJsonPath = path.join(addonPath, "addon.json");

    if (!(await fs.pathExists(addonJsonPath))) continue;

    const addonConfig: AddonConfig = await fs.readJSON(addonJsonPath);

    const destination = addonConfig.destination ?? "src";
    const targetPath = path.join(projectRoot, destination);

    await copyAndRenderTemplate(addonPath, targetPath, context);

    if (addonConfig.dependencies)
      allDependencies.push(...addonConfig.dependencies);

    if (addonConfig.devDependencies)
      allDevDependencies.push(...addonConfig.devDependencies);

    if (addonConfig.conditionalDependencies && config.db.provider) {
      const conditional =
        addonConfig.conditionalDependencies[config.db.provider];
      if (conditional) allDependencies.push(...conditional);
    }

    if (addonConfig.conditionalDevDependencies && config.db.provider) {
      const conditional =
        addonConfig.conditionalDevDependencies[config.db.provider];
      if (conditional) allDevDependencies.push(...conditional);
    }

    if (addonConfig.conditionalDevDependencies && config.db.provider) {
      const conditional =
        addonConfig.conditionalDevDependencies[config.db.provider];
      if (conditional) allDevDependencies.push(...conditional);
    }

    if (addonConfig.commands && addonConfig.commands?.length > 0) {
      commands.push(...addonConfig.commands);
    }
  }

  const depSpinner = spinner();
  depSpinner.start(
    pc.cyan(
      `Installing ${allDependencies.length} dependencies and ${allDevDependencies.length} dev dependencies`
    )
  );

  const installArg = config.packageManager === "npm" ? "install" : "add";

  if (allDependencies.length > 0) {
    try {
      await execa(config.packageManager, [installArg, ...allDependencies], {
        cwd: projectRoot,
        stdio: "pipe",
      });
    } catch (err) {
      log.error(pc.red(`Install failed: ${err.stderr}`));
      log.info(pc.red(`Dependencies: ${allDependencies.join(", ")}`));
    }
  }

  if (allDevDependencies.length > 0) {
    try {
      const devFlag = ["deno", "bun"].includes(config.packageManager)
        ? "--dev"
        : "-D";
      await execa(
        config.packageManager,
        [installArg, devFlag, ...allDevDependencies],
        {
          cwd: projectRoot,
          stdio: "pipe",
        }
      );
    } catch (err) {
      log.error(pc.red(`Install failed: ${err.stderr}`));
      log.info(pc.red(`Dev dependencies: ${allDevDependencies.join(", ")}`));
    }
  }

  depSpinner.stop(
    pc.cyan(
      `${allDependencies.length} Dependencies and ${allDevDependencies.length} Dev Dependencies installed successfully`
    )
  );

  if (commands.length > 0) {
    for (const { cmd, args } of commands) {
      const cmdExec = cmd
        .replace("npm", config.packageManager)
        .replace("npx", config.runtime === "bun" ? "bunx" : "npx");
      try {
        await execa(cmdExec, args, {
          cwd: projectRoot,
          stdio: "pipe",
        });
      } catch (err) {
        log.error(
          pc.red(`Command failed (${cmdExec} ${args.join(" ")}): ${err.stderr}`)
        );
      }
    }
  }

  if (["pnpm", "bun", "yarn"].includes(config.packageManager)) {
    deleteFile(path.join(projectRoot, "package-lock.json"));
  }
};

export default handleDeps;
