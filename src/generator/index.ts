import path from "node:path";
import { execa } from "execa";
import fs from "fs-extra";
import pc from "picocolors";
import { baseDeps, baseDevDeps } from "../constants/baseDeps";
import type {
  TProjectConfig,
  TProjectContext,
} from "../schema/ProjectConfigSchema";
import { copyAndRenderTemplate } from "./copyAndRender";

interface FeatureConfig {
  name: string;
  label: string;
  description: string;
  dependencies?: string[];
  conditionalDependencies?: Record<string, string[]>;
  destination?: string;
}

export async function generateProject(config: TProjectConfig) {
  const projectRoot = path.resolve(process.cwd(), config.name);

  const context = {
    ...config,
    ts: config.language === "ts",
  };

  const baseDir = path.resolve(`src/templates/base`);
  await copyAndRenderTemplate(baseDir, projectRoot, context);

  const selectedFeatures = selectFeatures(context);
  const allDependencies: string[] = baseDeps;
  const allDevDependencies: string[] = baseDevDeps;

  if (context.ts) allDependencies.push("tsx", "typescript");
  if (context.ts)
    allDevDependencies.push(
      "@types/cookie-parser",
      "@types/express",
      "@types/jsonwebtoken",
      "@types/node"
    );

  console.log(selectedFeatures);

  for (const featureName of selectedFeatures) {
    const featurePath = path.resolve(`src/templates/features/${featureName}`);
    const featureJsonPath = path.join(featurePath, "feature.json");

    if (!(await fs.pathExists(featureJsonPath))) continue;

    const featureConfig: FeatureConfig = await fs.readJSON(featureJsonPath);

    const destination = featureConfig.destination ?? "src";
    const targetPath = path.join(projectRoot, destination);

    await copyAndRenderTemplate(featurePath, targetPath, context);

    if (featureConfig.dependencies)
      allDependencies.push(...featureConfig.dependencies);

    if (featureConfig.conditionalDependencies && config.dbType) {
      const conditional = featureConfig.conditionalDependencies[config.dbType];
      if (conditional) allDependencies.push(...conditional);
    }
  }

  console.log(
    pc.cyan(
      `Installing ${allDependencies.length} dependencies and ${allDevDependencies.length} dev dependencies`
    )
  );
  if (allDependencies.length > 0) {
    try {
      await execa("npm", ["install", ...allDependencies], {
        cwd: projectRoot,
        stdio: "pipe",
      });
    } catch (err) {
      pc.red(`Install failed: ${err.stderr}`);
    }
  }

  if (allDevDependencies.length > 0) {
    try {
      await execa("npm", ["install", "--save-dev", ...allDevDependencies], {
        cwd: projectRoot,
        stdio: "pipe",
      });
    } catch (err) {
      pc.red(`Install failed: ${err.stderr}`);
    }
  }

  console.log(`✅ Project "${config.name}" generated successfully!`);
}

const selectFeatures = (config: TProjectContext) => {
  const selectedFeatures: string[] = [];

  if (config.prebuiltAuth) selectedFeatures.push("auth");
  if (config.useSocket) selectedFeatures.push("socket");

  if (config.useDatabase) {
    const feature = "db";
    let path: string | null = null;
    if (config.dbType === "PostgreSQL") path = `${feature}/prisma`;
    if (config.dbType === "MySQL") path = `${feature}/sequelize`;
    selectedFeatures.push(path);
  }

  return selectedFeatures;
};
