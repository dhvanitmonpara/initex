import crypto from "node:crypto";

function generateRandomString(length = 64) {
	return crypto.randomBytes(length).toString("hex");
}

export default generateRandomString;
