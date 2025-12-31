const DEPLOYMENT_USER_PRINCIPAL_TYPE = process.env["DEPLOYMENT_USER_PRINCIPAL_TYPE"];
if (!DEPLOYMENT_USER_PRINCIPAL_TYPE) {
	throw new Error("Missing DEPLOYMENT_USER_PRINCIPAL_TYPE environment variable");
}

export async function buildAiSearch(resourceGroup: azurenative.resources.ResourceGroup): Promise<{
	aiSearchService: azurenative.search.Service;
	indexName: string;
}> {
	const aiSearchService = new azurenative.search.Service("design-ai-search", {
		resourceGroupName: resourceGroup.name,
		location: resourceGroup.location,
		sku: {
			name: azurenative.search.SkuName.Free,
		},
		computeType: azurenative.search.ComputeType.Default,
		hostingMode: azurenative.search.HostingMode.Default,
		replicaCount: 1,
		partitionCount: 1,
		disableLocalAuth: true,
	});

	const me = azurenative.authorization.getClientConfigOutput();

	// Give the deployment user access to create an index
	const SEARCH_INDEX_DATA_CONTRIBUTOR = "8ebe5a00-799e-43f5-93ac-243d3dce84a7";

	const searchIndexDataContributorRole = azurenative.authorization.getRoleDefinitionOutput({
		roleDefinitionId: SEARCH_INDEX_DATA_CONTRIBUTOR,
		scope: aiSearchService.id,
	});

	const deployUserRoleAssignment = new azurenative.authorization.RoleAssignment(
		"deployment-user-search-contributor",
		{
			principalId: me.objectId,
			principalType: DEPLOYMENT_USER_PRINCIPAL_TYPE,
			roleDefinitionId: searchIndexDataContributorRole.id,
			scope: aiSearchService.id,
		},
	);

	const indexDefinition = {
		name: "designs-index",
		fields: [
			{
				name: "id",
				type: "Edm.String",
				key: true,
				searchable: false,
				retrievable: true,
			},
			{
				name: "name",
				type: "Edm.String",
				searchable: true,
				retrievable: true,
				sortable: true,
			},
			{
				name: "createdBy",
				type: "Edm.String",
				searchable: true,
				retrievable: true,
				filterable: true,
				facetable: true,
			},
			{
				name: "createdAt",
				type: "Edm.DateTimeOffset",
				retrievable: true,
				filterable: true,
				sortable: true,
			},
			{
				name: "updatedAt",
				type: "Edm.DateTimeOffset",
				retrievable: true,
				filterable: true,
				sortable: true,
			},
			{
				name: "frameCount",
				type: "Edm.Int32",
				retrievable: true,
				filterable: true,
				sortable: true,
				facetable: true,
			},
			{
				name: "totalDuration",
				type: "Edm.Int32",
				retrievable: true,
				filterable: true,
				sortable: true,
			},
			{
				name: "dominantColors",
				type: "Collection(Edm.String)",
				searchable: true,
				retrievable: true,
				filterable: true,
				facetable: true,
			},
			{
				name: "framesJson",
				type: "Edm.String",
				retrievable: true,
				searchable: false,
			},
		],
		suggesters: [
			{
				name: "sg",
				searchMode: "analyzingInfixMatching",
				sourceFields: ["name", "createdBy"],
			},
		],
		corsOptions: {
			allowedOrigins: ["*"],
			maxAgeInSeconds: 300,
		},
	};

	const indexJson = JSON.stringify(indexDefinition).replace(/'/g, "'\\''");

	$resolve(deployUserRoleAssignment).apply(() => {
		new command.local.Command("create-designs-index", {
			create: $interpolate`
				ACCESS_TOKEN=$(az account get-access-token --resource https://search.azure.com --query accessToken -o tsv) && \
				az rest --method PUT \
					--url "https://${aiSearchService.name}.search.windows.net/indexes/designs-index?api-version=2023-11-01" \
					--headers "Authorization=Bearer $ACCESS_TOKEN" "Content-Type=application/json" \
					--body '${indexJson}'
			`,
			delete: $interpolate`
				ACCESS_TOKEN=$(az account get-access-token --resource https://search.azure.com --query accessToken -o tsv) && \
				az rest --method DELETE \
					--url "https://${aiSearchService.name}.search.windows.net/indexes/designs-index?api-version=2023-11-01" \
					--headers "Authorization=Bearer $ACCESS_TOKEN" || true
			`,
		});
	});

	return {
		aiSearchService,
		indexName: indexDefinition.name,
	};
}
