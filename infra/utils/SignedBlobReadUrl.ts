export function signedBlobReadUrl(
	// Needs to be pre-generated
	blob: $util.Output<azurenative.storage.Blob>,
	container: azurenative.storage.BlobContainer,
	account: azurenative.storage.StorageAccount,
	resourceGroup: azurenative.resources.ResourceGroup,
): $util.Output<string> {
	const blobSAS = azurenative.storage.listStorageAccountServiceSASOutput({
		accountName: account.name,
		protocols: azurenative.storage.HttpProtocol.Https,
		sharedAccessExpiryTime: "2030-01-01",
		sharedAccessStartTime: "2021-01-01",
		resourceGroupName: resourceGroup.name,
		resource: azurenative.storage.SignedResource.C,
		permissions: azurenative.storage.Permissions.R,
		canonicalizedResource: $interpolate`/blob/${account.name}/${container.name}`,
		contentType: "application/json",
		cacheControl: "max-age=5",
		contentDisposition: "inline",
		contentEncoding: "deflate",
	});

	return $interpolate`https://${account.name}.blob.core.windows.net/${container.name}/${blob.name}?${blobSAS.serviceSasToken}`;
}
