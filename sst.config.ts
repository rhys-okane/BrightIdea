/// <reference path="./.sst/platform/config.d.ts" />

import app from "./packages/backend/src/App";

export default $config({
	app(input) {
		return {
			name: "brightidea",
			removal: input?.stage === "production" ? "retain" : "remove",
			protect: ["production"].includes(input?.stage),
			home: "local",
			providers: {
				"azure-native": {
					version: "3.8.0",
					location: "UK South",
				},
				command: "1.1.3",
			},
		};
	},
	async run() {
		// const database = new sst.cloudflare.D1("Database");
		// const databaseId = database.databaseId.apply(
		//   (id) => new sst.Secret("ProjectDatabaseId", id)
		// );
		// const turnstileSiteKey = new sst.Secret(
		//   "TurnstileSiteKey",
		//   process.env.CLOUDFLARE_TURNSTILE_SITE_KEY
		// );
		// const turnstileSecretKey = new sst.Secret(
		//   "TurnstileSecretKey",
		//   process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY
		// );
		// const hono = new sst.cloudflare.Worker("Hono", {
		//   url: true,
		//   link: [database, databaseId, turnstileSiteKey, turnstileSecretKey],
		//   handler: "packages/backend/src/App.ts",
		// });
		// hono.url.apply(
		//   (url) =>
		//     new sst.cloudflare.StaticSite("Frontend", {
		//       path: "packages/frontend",
		//       build: {
		//         command: "yarn build",
		//         output: "dist",
		//       },
		//       environment: {
		//         VITE_CLOUDFLARE_TURNSTILE_SITE_KEY:
		//           process.env.CLOUDFLARE_TURNSTILE_SITE_KEY,
		//         VITE_API_URL: url,
		//       },
		//     })
		// );
		// return {
		//   api: hono.url,
		//   databaseId: database.databaseId,
		// };
		const resourceGroup = new azurenative.resources.ResourceGroup("BrightIdeaDevResourceGroup");
		const storageAccount = new azurenative.storage.StorageAccount("storageaccount", {
			resourceGroupName: resourceGroup.name,
			sku: {
				name: azurenative.storage.SkuName.Standard_LRS,
			},
			accessTier: azurenative.storage.AccessTier.Hot,
			kind: "StorageV2",
		});
		const storageAccountKeys = azurenative.storage.listStorageAccountKeysOutput({
			resourceGroupName: resourceGroup.name,
			accountName: storageAccount.name,
		});

		// Wait for the storage account and resource group to be created before deploying the static site and function app
		$resolve([storageAccount, resourceGroup] as const).apply(async ([storageAccount, resourceGroup]) => {
			staticSite(storageAccount, resourceGroup);
			functionApp(storageAccount, resourceGroup);
		});

		return {
			primaryStorageKey: storageAccountKeys.keys[0].value,
			websiteUrl: storageAccount.primaryEndpoints.web,
		};
	},
});

function staticSite(
	storageAccount: azurenative.storage.StorageAccount,
	resourceGroup: azurenative.resources.ResourceGroup,
): void {
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

function functionApp(
	storageAccount: azurenative.storage.StorageAccount,
	resourceGroup: azurenative.resources.ResourceGroup,
) {
	const codeContainer = new azurenative.storage.BlobContainer("function-app-code-zips", {
		resourceGroupName: resourceGroup.name,
		accountName: storageAccount.name,
	});

	const codeBlob = new azurenative.storage.Blob("codefunction-app-code", {
		resourceGroupName: resourceGroup.name,
		accountName: storageAccount.name,
		containerName: codeContainer.name,
		source: $asset("./packages/backend/dist"),
		blobName: "code.zip",
	});

	const appServicePlan = new azurenative.web.AppServicePlan("app-service-plan", {
		resourceGroupName: resourceGroup.name,
		kind: "FunctionApp",
		reserved: true,
		sku: {
			name: "FC1",
			tier: "FlexConsumption",
		},
	});

	const functionApp = new azurenative.web.WebApp("function-app", {
		resourceGroupName: resourceGroup.name,
		location: resourceGroup.location,
		serverFarmId: appServicePlan.id,
		httpsOnly: true,
		kind: "functionapp",

		functionAppConfig: {
			runtime: {
				name: "node",
				version: "22",
			},
			deployment: {
				storage: {
					type: "BlobContainer",
					authentication: {
						type: "StorageAccountConnectionString",
						storageAccountConnectionStringName: "AzureWebJobsStorage",
					},
					value: getConnectionString(resourceGroup.name, storageAccount.name),
				},
			},
			scaleAndConcurrency: {
				alwaysReady: [],
				instanceMemoryMB: 512,
				maximumInstanceCount: 40,
			},
		},

		siteConfig: {
			appSettings: [
				{
					name: "AzureWebJobsStorage",
					value: getConnectionString(resourceGroup.name, storageAccount.name),
				},
				{
					name: "FUNCTIONS_EXTENSION_VERSION",
					value: "~4",
				},
			],
		},
	});

	return {
		hostname: functionApp.defaultHostName,
	};
}

export function getConnectionString(
	resourceGroupName: $util.Input<string>,
	storageAccountName: $util.Input<string>,
): $util.Output<string> {
	// Retrieve the primary storage account key.
	const storageAccountKeys = azurenative.storage.listStorageAccountKeysOutput({
		resourceGroupName,
		accountName: storageAccountName,
	});
	const primaryStorageKey = storageAccountKeys.keys[0].value;

	// Build the connection string to the storage account.
	return $interpolate`DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${primaryStorageKey}`;
}
