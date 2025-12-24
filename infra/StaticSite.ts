export function buildStaticSite(
	storageAccount: azurenative.storage.StorageAccount,
	resourceGroup: azurenative.resources.ResourceGroup,
	// TODO: Replace with a front door
	functionApp: azurenative.web.WebApp,
) {
	const staticWebsite = new azurenative.storage.StorageAccountStaticWebsite("staticwebsite", {
		accountName: storageAccount.name,
		resourceGroupName: resourceGroup.name,
		indexDocument: "index.html",
		error404Document: "index.html",
	});

	if (!process.env["CLOUDFLARE_TURNSTILE_SITE_KEY"]) {
		throw new Error("CLOUDFLARE_TURNSTILE_SITE_KEY environment variable is not set");
	}

	const buildJob = new command.local.Command("build-frontend", {
		dir: "../../packages/frontend",
		create: "yarn install",
		update: "yarn build",
		environment: {
			NODE_ENV: "production",
			VITE_API_URL: $interpolate`https://${functionApp.hostNames[0]}`,
			VITE_CLOUDFLARE_TURNSTILE_SITE_KEY: process.env["CLOUDFLARE_TURNSTILE_SITE_KEY"],
		},
	});

	$resolve(buildJob).apply(async () => {
		const fs = await import("fs/promises");

		const files = await fs.readdir("./packages/frontend/dist", {recursive: true, withFileTypes: true});

		const contentType = (fileName: string) => {
			const ext = fileName.split(".").pop();
			switch (ext) {
				case "html":
					return "text/html";
				case "css":
					return "text/css";
				case "js":
					return "application/javascript";
				case "svg":
					return "image/svg+xml";
			}
		};

		const path = await import("path");

		for (const file of files) {
			const relativePath = path.relative("./packages/frontend/dist", path.join(file.parentPath, file.name));
			if (file.isDirectory()) {
				continue;
			}

			new azurenative.storage.Blob(file.name.replace(/[^a-zA-Z0-9-_]/g, "-"), {
				resourceGroupName: resourceGroup.name,
				accountName: storageAccount.name,
				containerName: staticWebsite.containerName,
				source: $asset(path.join(file.parentPath, file.name)),
				contentType: contentType(file.name),
				blobName: relativePath.replaceAll("\\", "/"),
			});
		}
	});
}
