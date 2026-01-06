export function buildStaticSite(
  storageAccount: azurenative.storage.StorageAccount,
  resourceGroup: azurenative.resources.ResourceGroup
): azurenative.storage.StorageAccountStaticWebsite {
  return new azurenative.storage.StorageAccountStaticWebsite("staticwebsite", {
    accountName: storageAccount.name,
    resourceGroupName: resourceGroup.name,
    indexDocument: "index.html",
    error404Document: "index.html",
  });
}
