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

	new syncedfolder.AzureBlobFolder("frontend-upload", {
		resourceGroupName: resourceGroup.name,
		storageAccountName: storageAccount.name,
		containerName: staticWebsite.containerName,
		path: "../../packages/frontend/dist",
	});
}
