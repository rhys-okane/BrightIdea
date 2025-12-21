/// <reference path="./.sst/platform/config.d.ts" />

import {file} from "bun";
import path = require("path");

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
		const {buildKeyVault} = await import("./infra/KeyVault");
		const {buildStaticSite} = await import("./infra/StaticSite");
		const {buildFunctionApp} = await import("./infra/FunctionApp");
		const {buildApplicationInsights} = await import("./infra/ApplicationInsights");

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
		const functionApp = $resolve([storageAccount, resourceGroup] as const).apply(
			async ([storageAccount, resourceGroup]) => {
				buildStaticSite(storageAccount, resourceGroup);
				const {turnstileSecret} = buildKeyVault(resourceGroup);
				const applicationInsights = buildApplicationInsights(resourceGroup);

				return await buildFunctionApp(storageAccount, resourceGroup, turnstileSecret, applicationInsights);
			},
		);

		return {
			primaryStorageKey: storageAccountKeys.keys[0].value,
			websiteUrl: storageAccount.primaryEndpoints.web,
			resourceGroupName: resourceGroup.name,
			functionAppName: functionApp.name,
		};
	},
});
