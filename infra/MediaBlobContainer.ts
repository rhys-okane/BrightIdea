export const buildMediaBlobContainer = (
  resourceGroup: azurenative.resources.ResourceGroup,
  storageAccount: azurenative.storage.StorageAccount
) => {
  const mediaBlobContainer = new azurenative.storage.BlobContainer("media-blob-container", {
    accountName: storageAccount.name,
    resourceGroupName: resourceGroup.name,
    publicAccess: azurenative.storage.PublicAccess.Blob,
  });

  return { mediaBlobContainer };
};
