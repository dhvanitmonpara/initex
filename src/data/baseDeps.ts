const baseDevDeps = [
	"swagger-jsdoc",
	"swagger-ui-express",
	"@types/cookie-parser",
	"@types/express",
	"@types/jsonwebtoken",
	"@types/node",
	"@types/cors",
	"@types/swagger-jsdoc",
	"@types/swagger-ui-express",
	"@types/multer",
	"esbuild-plugin-alias",
	"@asteasolutions/zod-to-openapi",
	"@types/morgan",
];
const baseDeps = [
	"cookie-parser",
	"cors",
	"dotenv",
	"express",
	"zod",
	"helmet",
	"multer",
	"typescript@5.9.3",
	"morgan",
	"winston",
	"rate-limiter-flexible",
];

export { baseDeps, baseDevDeps };
