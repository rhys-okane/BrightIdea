export function buildStaticSite(
	storageAccount: azurenative.storage.StorageAccount,
	resourceGroup: azurenative.resources.ResourceGroup,
) {
	const staticWebsite = new azurenative.storage.StorageAccountStaticWebsite("staticwebsite", {
		accountName: storageAccount.name,
		resourceGroupName: resourceGroup.name,
		indexDocument: "index.html",
		error404Document: "index.html",
	});

	const buildJob = new command.local.Command("build-frontend", {
		dir: "../../packages/frontend",
		create: "yarn install",
		update: "yarn build",
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
