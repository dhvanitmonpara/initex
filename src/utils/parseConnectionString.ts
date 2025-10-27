import { URL } from "node:url";

export function parseConnectionString(
	connectionString: string,
	{ inDocker = false } = {},
) {
	try {
		// Handle mongodb+srv manually
		if (connectionString.startsWith("mongodb+srv://")) {
			const pattern = /^mongodb\+srv:\/\/([^:]+):([^@]+)@([^/]+)\/?([^?]*)/;
			const match = connectionString.match(pattern);
			if (!match) throw new Error("Invalid MongoDB+SRV connection string");

			const [, dbUser, dbPassword, dbHost, dbName] = match;
			return {
				dbType: "mongodb",
				dbUser,
				dbPassword,
				dbHost,
				dbPort: "", // SRV doesn’t specify port
				dbName: dbName || "",
			};
		}

		// Generic handler
		const url = new URL(connectionString);
		const dbType = url.protocol.replace(":", "");

		let dbHost = url.hostname;
		const dbPort =
			url.port ||
			(dbType === "mysql"
				? "3306"
				: dbType === "postgres"
					? "5432"
					: dbType === "mongodb"
						? "27017"
						: "");

		const dbUser = url.username;
		const dbPassword = url.password;
		const dbName = url.pathname.replace("/", "") || "";

		// inside docker, replace localhost with the service name
		if (inDocker && dbHost === "localhost") {
			if (["mysql", "postgres", "mongodb"].includes(dbType)) {
				dbHost = "db";
			}
		}

		return { dbType, dbUser, dbPassword, dbHost, dbPort, dbName };
	} catch {
		throw new Error(`Invalid connection string: ${connectionString}`);
	}
}
