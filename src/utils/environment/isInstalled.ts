import { execa } from "execa";

export async function isInstalled(cmd: string): Promise<boolean> {
	try {
		await execa(cmd, ["--version"], {
			stdout: "ignore",
			stderr: "ignore",
			timeout: 1500,
		});
		return true;
	} catch {
		return false;
	}
}
