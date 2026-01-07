interface KeyVaultOutput {
  keyVault: azurenative.keyvault.Vault;
  turnstileSecret: azurenative.keyvault.Secret;
  auth0ManagementClientSecret: azurenative.keyvault.Secret;
}

const auth0ManagementClientSecretValue = process.env["AUTH0_MANAGEMENT_CLIENT_SECRET"];

if (!auth0ManagementClientSecretValue) {
  throw new Error("Missing AUTH0_MANAGEMENT_CLIENT_SECRET environment variable");
}

export const buildKeyVault = (
  resourceGroup: azurenative.resources.ResourceGroup,
  applicationInsightsWorkspace: azurenative.operationalinsights.Workspace
): KeyVaultOutput => {
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

  const auth0ManagementClientSecret = new azurenative.keyvault.Secret("auth0-management-client-secret", {
    resourceGroupName: resourceGroup.name,
    vaultName: keyVault.name,
    properties: {
      value: auth0ManagementClientSecretValue,
    },
  });

  new azurenative.monitor.DiagnosticSetting("keyvault-diagnostic-setting", {
    resourceUri: keyVault.id,
    logs: [
      {
        categoryGroup: "allLogs",
        enabled: true,
        retentionPolicy: {
          days: 0,
          enabled: false,
        },
      },
    ],
    metrics: [
      {
        enabled: true,
        category: "AllMetrics",
        retentionPolicy: {
          days: 0,
          enabled: false,
        },
      },
    ],
    workspaceId: applicationInsightsWorkspace.id,
  });

  return {
    keyVault,
    turnstileSecret,
    auth0ManagementClientSecret,
  };
};
