export function getConnectionString(
	resourceGroupName: $util.Input<string>,
	storageAccountName: $util.Input<string>,
): $util.Output<string> {
	// Retrieve the primary storage account key.
	const storageAccountKeys = azurenative.storage.listStorageAccountKeysOutput({
		resourceGroupName,
		accountName: storageAccountName,
	});
	const primaryStorageKey = storageAccountKeys.keys[0].value;

	// Build the connection string to the storage account.
	return $interpolate`DefaultEndpointsProtocol=https;AccountName=${storageAccountName};AccountKey=${primaryStorageKey}`;
}
