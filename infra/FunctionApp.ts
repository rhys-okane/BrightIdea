import app from "../packages/backend/src/App";

export async function buildFunctionApp(
	storageAccount: azurenative.storage.StorageAccount,
	resourceGroup: azurenative.resources.ResourceGroup,
	turnstileSecret: azurenative.keyvault.Secret,
	applicationInsights: azurenative.applicationinsights.Component,
) {
	const codeContainer = new azurenative.storage.BlobContainer("function-app-code-zips", {
		resourceGroupName: resourceGroup.name,
		accountName: storageAccount.name,
	});

	// const codeBlob = $resolve(buildJob).apply(() => {
	// 	return new azurenative.storage.Blob("codefunction-app-code", {
	// 		resourceGroupName: resourceGroup.name,
	// 		accountName: storageAccount.name,
	// 		containerName: codeContainer.name,
	// 		source: $asset("./packages/backend/dist"),
	// 		blobName: "code.zip",
	// 	});
	// });

	const appServicePlan = new azurenative.web.AppServicePlan("app-service-plan", {
		resourceGroupName: resourceGroup.name,
		kind: "FunctionApp",
		reserved: true,
		sku: {
			name: "FC1",
			tier: "FlexConsumption",
		},
	});

	const getConnectionString = (await import("./utils/BlobStorageConnectionString")).getConnectionString;

	const userAssignedIdentity = new azurenative.managedidentity.UserAssignedIdentity("function-app-identity", {
		resourceGroupName: resourceGroup.name,
		location: resourceGroup.location,
	});

	const functionApp = new azurenative.web.WebApp("function-app", {
		resourceGroupName: resourceGroup.name,
		location: resourceGroup.location,
		serverFarmId: appServicePlan.id,
		httpsOnly: true,
		kind: "functionapp",

		identity: {
			type: azurenative.web.ManagedServiceIdentityType.SystemAssigned_UserAssigned,
			userAssignedIdentities: [userAssignedIdentity.id],
		},

		functionAppConfig: {
			runtime: {
				name: "node",
				version: "22",
			},
			deployment: {
				storage: {
					authentication: {
						type: azurenative.web.AuthenticationType.UserAssignedIdentity,
						userAssignedIdentityResourceId: userAssignedIdentity.id,
					},
					type: azurenative.web.FunctionsDeploymentStorageType.BlobContainer,
					// value: getConnectionString(resourceGroup.name, storageAccount.name),
					value: $interpolate`https://${storageAccount.name}.blob.core.windows.net/${codeContainer.name}`,
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
				// TODO: Can we remove this?
				{
					name: "AzureWebJobsStorage",
					value: getConnectionString(resourceGroup.name, storageAccount.name),
				},
				{
					name: "DEPLOYMENT_STORAGE_CONNECTION_STRING",
					value: getConnectionString(resourceGroup.name, storageAccount.name),
				},
				{
					name: "FUNCTIONS_EXTENSION_VERSION",
					value: "~4",
				},
				{
					name: "TURNSTILE_SECRET",
					value: `@Microsoft.KeyVault(SecretUri=${turnstileSecret.properties.secretUriWithVersion})`,
				},
				{
					name: "APPLICATIONINSIGHTS_CONNECTION_STRING",
					value: applicationInsights.connectionString,
				},
			],
		},
	});

	const STORAGE_BLOB_DATA_CONTRIBUTOR = "ba92f5b4-2d11-453d-a403-e96b0029c9fe";

	const storageBlobDataContributorRole = azurenative.authorization.getRoleDefinitionOutput({
		roleDefinitionId: STORAGE_BLOB_DATA_CONTRIBUTOR,
		scope: storageAccount.id,
	});

	// TODO: see if you can remove this and let the managed identity deal with it
	// Role assignment to allow the function app to read from the storage account
	new azurenative.authorization.RoleAssignment("functionDeploymentRole", {
		principalId: userAssignedIdentity.principalId, // user-assigned identity principal
		principalType: "ServicePrincipal",
		roleDefinitionId: storageBlobDataContributorRole.id,
		scope: $interpolate`${storageAccount.id}/blobServices/default/containers/${codeContainer.name}`,
	});

	return functionApp;
}
