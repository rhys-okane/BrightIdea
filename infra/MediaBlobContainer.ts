export const buildMediaBlobContainer = (
	resourceGroup: azurenative.resources.ResourceGroup,
	storageAccount: azurenative.storage.StorageAccount,
) => {
	return new azurenative.storage.BlobContainer("media-blob-container", {
		accountName: storageAccount.name,
		resourceGroupName: resourceGroup.name,
		containerName: "media",
		publicAccess: azurenative.storage.PublicAccess.None,
	});
};
