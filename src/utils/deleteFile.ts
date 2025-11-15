import fs from "fs-extra";

const deleteFile = (path: string) => {
	try {
		fs.removeSync(path);
	} catch (err) {
		console.error(`Error deleting file ${path}: ${err}`);
	}
};

export default deleteFile;
