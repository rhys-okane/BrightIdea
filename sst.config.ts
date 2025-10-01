/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
	app(input) {
		return {
			name: "highbrow",
			removal: input?.stage === "production" ? "retain" : "remove",
			protect: ["production"].includes(input?.stage),
			home: "cloudflare",
		};
	},
	async run() {
		new sst.cloudflare.StaticSite("Frontend", {
			path: "packages/frontend",
			build: {
				command: "yarn build",
				output: "dist",
			},
			environment: {
				VITE_CLOUDFLARE_TURNSTILE_SITE_KEY: process.env.CLOUDFLARE_TURNSTILE_SITE_KEY,
				VITE_CLOUDFLARE_TURNSTILE_SECRET_KEY: process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY,
			},
		});

		const database = new sst.cloudflare.D1("Database");

		const databaseId = database.databaseId.apply(id => new sst.Secret("ProjectDatabaseId", id));

		const turnstileSiteKey = new sst.Secret("TurnstileSiteKey", process.env.CLOUDFLARE_TURNSTILE_SITE_KEY);
		const turnstileSecretKey = new sst.Secret("TurnstileSecretKey", process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY);

		const hono = new sst.cloudflare.Worker("Hono", {
			url: true,
			link: [database, databaseId, turnstileSiteKey, turnstileSecretKey],
			handler: "packages/backend/src/App.ts",
		});

		return {
			api: hono.url,
			databaseId: database.databaseId,
		};
	},
});
