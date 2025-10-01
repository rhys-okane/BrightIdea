import dotenv from "dotenv";
import {defineConfig} from "drizzle-kit";
import path from "path";
import {Resource} from "sst";

const {parsed: env} = dotenv.config({
	path: path.resolve(__dirname, "../../.env"),
});

if (!env) {
	throw new Error("Failed to load .env file");
}

if (!env.CLOUDFLARE_DEFAULT_ACCOUNT_ID || !env.DRIZZLE_KIT_DATABASE_ID || !env.CLOUDFLARE_API_TOKEN) {
	throw new Error("Missing required environment variables");
}

export default defineConfig({
	out: "./drizzle",
	schema: "./src/database/schema",
	dialect: "sqlite",
	driver: "d1-http",
	dbCredentials: {
		accountId: env.CLOUDFLARE_DEFAULT_ACCOUNT_ID,
		databaseId: env.DRIZZLE_KIT_DATABASE_ID,
		token: env.CLOUDFLARE_API_TOKEN,
	},
});
