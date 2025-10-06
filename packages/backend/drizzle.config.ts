import dotenv from "dotenv";
import {defineConfig} from "drizzle-kit";
import path from "path";
import outputs from "../../.sst/outputs.json" with {type: "json"};

dotenv.config({
	path: path.resolve(__dirname, "../../.env"),
});

if (!process.env.CLOUDFLARE_DEFAULT_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
	throw new Error("Missing required environment variables");
}


export default defineConfig({
	out: "./drizzle",
	schema: "./src/database/schema",
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_DEFAULT_ACCOUNT_ID,
		databaseId: outputs.databaseId,
		token: process.env.CLOUDFLARE_API_TOKEN,
	},
});
