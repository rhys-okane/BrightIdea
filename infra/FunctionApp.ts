interface FunctionAppParameters {
	storageAccount: azurenative.storage.StorageAccount;
	resourceGroup: azurenative.resources.ResourceGroup;
	turnstileSecret: azurenative.keyvault.Secret;
	applicationInsights: azurenative.applicationinsights.Component;
	cosmosDbAccount: azurenative.cosmosdb.DatabaseAccount;
	keyVault: azurenative.keyvault.Vault;
	emailService: azurenative.communication.EmailService;
	emailDomain: azurenative.communication.Domain;
	mediaBlobContainer: azurenative.storage.BlobContainer;
	aiSearchService: azurenative.search.Service;
}
export async function buildFunctionApp({
	storageAccount,
	resourceGroup,
	turnstileSecret,
	applicationInsights,
	cosmosDbAccount,
	keyVault,
	emailService,
	emailDomain,
	mediaBlobContainer,
	aiSearchService,
}: FunctionAppParameters) {
	const codeContainer = new azurenative.storage.BlobContainer("function-app-code-zips", {
		resourceGroupName: resourceGroup.name,
		accountName: storageAccount.name,
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
					value: $interpolate`@Microsoft.KeyVault(SecretUri=${turnstileSecret.properties.secretUriWithVersion})`,
				},
				{
					name: "APPLICATIONINSIGHTS_CONNECTION_STRING",
					value: applicationInsights.connectionString,
				},
				{
					name: "COSMOS_ENDPOINT",
					value: cosmosDbAccount.documentEndpoint,
				},
				{
					name: "EMAIL_SENDER_DOMAIN",
					value: emailDomain.fromSenderDomain,
				},
				{
					name: "EMAIL_SERVICE_ENDPOINT",
					value: $interpolate`https://${emailService.name}.communication.azure.com`,
				},
			],
			cors: {
				allowedOrigins: [
					storageAccount.primaryEndpoints.web.apply(endpoint => endpoint.replace(/\/$/, "")),
					"http://localhost",
				],
				supportCredentials: true,
			},
		},
	});

	const STORAGE_BLOB_DATA_CONTRIBUTOR = "ba92f5b4-2d11-453d-a403-e96b0029c9fe";

	const storageBlobDataContributorRole = azurenative.authorization.getRoleDefinitionOutput({
		roleDefinitionId: STORAGE_BLOB_DATA_CONTRIBUTOR,
		scope: storageAccount.id,
	});

	$resolve(functionApp.identity).apply(identity => {
		if (!identity || !identity.principalId) {
			throw new Error("Function App identity not found");
		}

		// Grant access to Cosmos Control Plane
		const COSMOS_DB_OPERATOR = "230815da-be43-4aae-9cb4-875f7bd000aa";

		const cosmosDbOperator = azurenative.authorization.getRoleDefinitionOutput({
			roleDefinitionId: COSMOS_DB_OPERATOR,
			scope: storageAccount.id,
		});

		new azurenative.authorization.RoleAssignment("functionCosmosDbControlPlaneAccessRole", {
			principalId: identity.principalId,
			principalType: "ServicePrincipal",
			roleDefinitionId: cosmosDbOperator.id,
			scope: cosmosDbAccount.id,
		});

		// Grant access to Cosmos Data Plane

		// Manually generated
		const sqlRoleDefinitionId = "04e8da3a-6e2b-40be-98d8-d46035af5f0e";
		const sqlRoleDefinition = new azurenative.cosmosdb.SqlResourceSqlRoleDefinition("sqlRoleDefinition", {
			accountName: cosmosDbAccount.name,
			resourceGroupName: resourceGroup.name,
			roleDefinitionId: sqlRoleDefinitionId,
			roleName: "Azure Cosmos DB for NoSQL Data Plane Owner",
			type: "CustomRole",
			assignableScopes: [cosmosDbAccount.id],
			permissions: [
				{
					dataActions: [
						"Microsoft.DocumentDB/databaseAccounts/readMetadata",
						"Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/*",
						"Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/*",
					],
				},
			],
		});

		// Generated manually for stability
		const cosmosDataAccessAssignmentId = "a55b4ab2-8393-4ebd-b7a3-5bb8d65c952b";

		// Role assignment to allow the function app to access Cosmos DB
		new azurenative.cosmosdb.SqlResourceSqlRoleAssignment("functionCosmosDbRoleAssignment", {
			roleAssignmentId: cosmosDataAccessAssignmentId,
			accountName: cosmosDbAccount.name,
			resourceGroupName: resourceGroup.name,
			roleDefinitionId: sqlRoleDefinition.id,
			principalId: identity.principalId,
			scope: cosmosDbAccount.id,
		});

		// Grant access to Key Vault secrets
		const KEY_VAULT_SECRETS_USER = "4633458b-17de-408a-b874-0445c86b69e6"; // Key Vault Secrets User

		const keyVaultSecretsUserRole = azurenative.authorization.getRoleDefinitionOutput({
			roleDefinitionId: KEY_VAULT_SECRETS_USER,
			scope: storageAccount.id,
		});

		new azurenative.authorization.RoleAssignment("functionAppKeyVaultAccess", {
			principalId: identity.principalId,
			principalType: "ServicePrincipal",
			roleDefinitionId: keyVaultSecretsUserRole.id,
			scope: keyVault.id,
		});

		// Grant access to send emails via Communication Services
		const communicationServicesEmailSenderRole = new azurenative.authorization.RoleDefinition(
			"functionAppEmailSenderRole",
			{
				roleName: "Communication Services Email Sender",
				permissions: [
					{
						actions: [
							"Microsoft.Communication/CommunicationServices/Read",
							"Microsoft.Communication/CommunicationServices/Write",
						],
					},
				],
				assignableScopes: [emailService.id],
				scope: emailService.id,
			},
		);

		new azurenative.authorization.RoleAssignment("functionAppCommunicationServicesEmailSenderRole", {
			principalId: identity.principalId,
			principalType: "ServicePrincipal",
			roleDefinitionId: communicationServicesEmailSenderRole.id,
			scope: emailService.id,
		});

		// Access to the media blob container
		new azurenative.authorization.RoleAssignment("mediaBlobContainerAccess", {
			principalId: userAssignedIdentity.principalId,
			principalType: "ServicePrincipal",
			roleDefinitionId: storageBlobDataContributorRole.id,
			scope: $interpolate`${storageAccount.id}/blobServices/default/containers/${mediaBlobContainer.name}`,
		});

		// AI Search index access
		const SEARCH_INDEX_DATA_CONTRIBUTOR = "8ebe5a00-799e-43f5-93ac-243d3dce84a7";

		const searchIndexDataContributorRole = azurenative.authorization.getRoleDefinitionOutput({
			roleDefinitionId: SEARCH_INDEX_DATA_CONTRIBUTOR,
			scope: aiSearchService.id,
		});

		new azurenative.authorization.RoleAssignment("aiSearchServiceAccess", {
			principalId: identity.principalId,
			principalType: "ServicePrincipal",
			roleDefinitionId: searchIndexDataContributorRole.id,
			scope: aiSearchService.id,
		});
	});

	// Role assignment to allow the function app to read from the storage account
	// This allows the function to access the code in the blob container
	new azurenative.authorization.RoleAssignment("functionDeploymentRole", {
		principalId: userAssignedIdentity.principalId,
		principalType: "ServicePrincipal",
		roleDefinitionId: storageBlobDataContributorRole.id,
		scope: $interpolate`${storageAccount.id}/blobServices/default/containers/${codeContainer.name}`,
	});

	return functionApp;
}
