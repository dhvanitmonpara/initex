export interface AddonConfig {
	name: string;
	label: string;
	description: string;
	dependencies?: string[];
	devDependencies?: string[];
	conditionalDependencies?: Record<string, string[]>;
	conditionalDevDependencies?: Record<string, string[]>;
	destination?: string;
	commands?: {
		cmd: string;
		args: string[];
		silent?: boolean;
	}[];
}
