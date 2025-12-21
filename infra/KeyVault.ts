interface KeyVaultOutput {
	keyVault: azurenative.keyvault.Vault;
	turnstileSecret: azurenative.keyvault.Secret;
}

export const buildKeyVault = (resourceGroup: azurenative.resources.ResourceGroup): KeyVaultOutput => {
	const keyVault = new azurenative.keyvault.Vault("key-vault", {
		resourceGroupName: resourceGroup.name,
		properties: {
			sku: {
				name: azurenative.keyvault.SkuName.Standard,
				family: "A",
			},
			tenantId: azurenative.authorization.getClientConfigOutput().tenantId,
			enableSoftDelete: false,
			enableRbacAuthorization: true,
		},
	});

	const turnstileSecret = new azurenative.keyvault.Secret("turnstile-secret", {
		resourceGroupName: resourceGroup.name,
		vaultName: keyVault.name,
		properties: {
			value: process.env["CLOUDFLARE_TURNSTILE_SECRET_KEY"] || "",
		},
	});

	return {
		keyVault,
		turnstileSecret,
	};
};
