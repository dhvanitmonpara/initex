import { intro, log, outro } from "@clack/prompts";
import { consola } from "consola";
import { teen } from "gradient-string";
import pc from "picocolors";
import { generateProject } from "./generator";
import { promptProjectConfig } from "./prompts/projectPrompts";
async function main() {
    consola.box(teen("🚀 Welcome to Initex CLI"));
    intro(pc.italic(pc.cyan("Let's initialize your new project!")));
    const config = await promptProjectConfig();
    await generateProject(config);
    log.success(`${pc.bold(pc.cyan("Project ready:"))} ${config.name}`);
    log.info(`Next steps:\n${pc.gray(`cd ${config.name} && npm install`)}`);
    outro(`Project ${pc.bold(pc.cyan(config.name))} created with express version ${config.expressVersion}`);
    return config;
}
main().catch((err) => {
    consola.error("💥 Unexpected error:", err);
    process.exit(1);
});
