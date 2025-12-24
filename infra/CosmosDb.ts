export const buildCosmosDb = (
	resourceGroup: azurenative.resources.ResourceGroup,
	storageAccount: azurenative.storage.StorageAccount,
) => {
	const cosmosDbAccount = new azurenative.cosmosdb.DatabaseAccount("cosmosdb-account", {
		resourceGroupName: resourceGroup.name,
		databaseAccountOfferType: azurenative.cosmosdb.DatabaseAccountOfferType.Standard,
		locations: [
			{
				locationName: resourceGroup.location,
				failoverPriority: 0,
			},
		],
		consistencyPolicy: {
			defaultConsistencyLevel: azurenative.cosmosdb.DefaultConsistencyLevel.Session,
		},
		kind: "GlobalDocumentDB",
		capabilities: [
			{
				name: "EnableServerless",
			},
		],
		disableLocalAuth: true,
	});

	const cosmosDbDatabase = new azurenative.cosmosdb.SqlResourceSqlDatabase("cosmosdb-database", {
		resourceGroupName: resourceGroup.name,
		accountName: cosmosDbAccount.name,
		resource: {
			id: "cosmosdb-database",
		},
	});

	new azurenative.cosmosdb.SqlResourceSqlContainer("designs-container", {
		resourceGroupName: resourceGroup.name,
		accountName: cosmosDbAccount.name,
		databaseName: cosmosDbDatabase.name,
		resource: {
			id: "designs-container",
			partitionKey: {
				paths: ["/designId"],
				kind: "Hash",
			},
			indexingPolicy: {
				indexingMode: "consistent",
				automatic: true,
			},
			uniqueKeyPolicy: {
				uniqueKeys: [
					{
						paths: ["/name"],
					},
				],
			},
		},
	});

	return {cosmosDbDatabase, cosmosDbAccount};
};
