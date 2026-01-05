const domain = process.env["AUTH0_MANAGEMENT_DOMAIN"];
const clientId = process.env["AUTH0_MANAGEMENT_CLIENT_ID"];
const clientSecret = process.env["AUTH0_MANAGEMENT_CLIENT_SECRET"];

if (!domain) {
  throw new Error("Missing AUTH0_MANAGEMENT_DOMAIN environment variable");
}

if (!clientId) {
  throw new Error("Missing AUTH0_MANAGEMENT_CLIENT_ID environment variable");
}

if (!clientSecret) {
  throw new Error("Missing AUTH0_MANAGEMENT_CLIENT_SECRET environment variable");
}

interface FunctionAppParameters {
  storageAccount: azurenative.storage.StorageAccount;
  resourceGroup: azurenative.resources.ResourceGroup;
  turnstileSecret: azurenative.keyvault.Secret;
  applicationInsightsComponent: azurenative.applicationinsights.Component;
  applicationInsightsWorkspace: azurenative.operationalinsights.Workspace;
  cosmosDbAccount: azurenative.cosmosdb.DatabaseAccount;
  keyVault: azurenative.keyvault.Vault;
  communicationService: azurenative.communication.CommunicationService;
  emailDomain: azurenative.communication.Domain;
  mediaBlobContainer: azurenative.storage.BlobContainer;
  aiSearchService: azurenative.search.Service;
  primaryStorageKey: string;
}
export async function buildFunctionApp({
  storageAccount,
  resourceGroup,
  turnstileSecret,
  applicationInsightsComponent,
  applicationInsightsWorkspace,
  cosmosDbAccount,
  keyVault,
  communicationService,
  emailDomain,
  mediaBlobContainer,
  aiSearchService,
  primaryStorageKey,
}: FunctionAppParameters) {
  const codeContainer = new azurenative.storage.BlobContainer("function-app-code-zips", {
    resourceGroupName: resourceGroup.name,
    accountName: storageAccount.name,
  });

  const appServicePlan = new azurenative.web.AppServicePlan("app-service-plan", {
    resourceGroupName: resourceGroup.name,
    kind: "FunctionApp",
    reserved: true,
    sku: {
      name: "FC1",
      tier: "FlexConsumption",
    },
  });

  const getConnectionString = (await import("./utils/BlobStorageConnectionString")).getConnectionString;

  const userAssignedIdentity = new azurenative.managedidentity.UserAssignedIdentity("function-app-identity", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
  });

  const aiSearchEndpoint = aiSearchService.endpoint.apply((endpoint) => {
    return endpoint ?? "NO_ENDPOINT_FOUND";
  });

  const functionApp = new azurenative.web.WebApp("function-app", {
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    serverFarmId: appServicePlan.id,
    httpsOnly: true,
    kind: "functionapp",

    identity: {
      type: azurenative.web.ManagedServiceIdentityType.SystemAssigned_UserAssigned,
      userAssignedIdentities: [userAssignedIdentity.id],
    },

    functionAppConfig: {
      runtime: {
        name: "node",
        version: "22",
      },
      deployment: {
        storage: {
          authentication: {
            type: azurenative.web.AuthenticationType.UserAssignedIdentity,
            userAssignedIdentityResourceId: userAssignedIdentity.id,
          },
          type: azurenative.web.FunctionsDeploymentStorageType.BlobContainer,
          // value: getConnectionString(resourceGroup.name, storageAccount.name),
          value: $interpolate`https://${storageAccount.name}.blob.core.windows.net/${codeContainer.name}`,
        },
      },
      scaleAndConcurrency: {
        alwaysReady: [],
        instanceMemoryMB: 512,
        maximumInstanceCount: 40,
      },
    },

    siteConfig: {
      appSettings: [
        {
          name: "AzureWebJobsStorage",
          value: getConnectionString(resourceGroup.name, storageAccount.name),
        },
        {
          name: "DEPLOYMENT_STORAGE_CONNECTION_STRING",
          value: getConnectionString(resourceGroup.name, storageAccount.name),
        },
        {
          name: "FUNCTIONS_EXTENSION_VERSION",
          value: "~4",
        },
        {
          name: "TURNSTILE_SECRET",
          value: $interpolate`@Microsoft.KeyVault(SecretUri=${turnstileSecret.properties.secretUriWithVersion})`,
        },
        {
          name: "APPLICATIONINSIGHTS_CONNECTION_STRING",
          value: applicationInsightsComponent.connectionString,
        },
        {
          name: "COSMOS_ENDPOINT",
          value: cosmosDbAccount.documentEndpoint,
        },
        {
          name: "EMAIL_SENDER_DOMAIN",
          value: emailDomain.fromSenderDomain,
        },
        {
          name: "EMAIL_SERVICE_ENDPOINT",
          value: $interpolate`https://${communicationService.hostName}`,
        },
        {
          name: "MEDIA_BLOB_CONTAINER_NAME",
          value: mediaBlobContainer.name,
        },
        {
          name: "AI_SEARCH_SERVICE_ENDPOINT",
          value: aiSearchEndpoint,
        },
        {
          name: "AI_SEARCH_INDEX_NAME",
          value: "designs-index",
        },
        {
          name: "AUTH0_MANAGEMENT_DOMAIN",
          value: domain,
        },
        {
          name: "AUTH0_MANAGEMENT_CLIENT_ID",
          value: clientId,
        },
        {
          name: "AUTH0_MANAGEMENT_CLIENT_SECRET",
          value: clientSecret,
        },
        {
          name: "STORAGE_ACCOUNT_NAME",
          value: storageAccount.name,
        },
        {
          name: "STORAGE_ACCOUNT_KEY",
          value: primaryStorageKey,
        },
        {
          name: "MEDIA_CONTAINER_NAME",
          value: mediaBlobContainer.name,
        },
        {
          name: "AzureWebJobsMediaContainer__accountName",
          value: storageAccount.name,
        },
        {
          name: "AzureWebJobsMediaContainer__blobServiceUri",
          value: $interpolate`https://${storageAccount.name}.blob.core.windows.net`,
        },
        {
          name: "AzureWebJobsMediaContainer__queueServiceUri",
          value: $interpolate`https://${storageAccount.name}.queue.core.windows.net`,
        },
      ],
      cors: {
        allowedOrigins: [
          storageAccount.primaryEndpoints.web.apply((endpoint) => endpoint.replace(/\/$/, "")),
          "http://localhost",
        ],
        supportCredentials: true,
      },
    },
  });

  const STORAGE_BLOB_DATA_CONTRIBUTOR = "ba92f5b4-2d11-453d-a403-e96b0029c9fe";

  const storageBlobDataContributorRole = azurenative.authorization.getRoleDefinitionOutput({
    roleDefinitionId: STORAGE_BLOB_DATA_CONTRIBUTOR,
    scope: storageAccount.id,
  });

  $resolve(functionApp.identity).apply((identity) => {
    if (!identity || !identity.principalId) {
      throw new Error("Function App identity not found");
    }

    // Grant access to Cosmos Control Plane
    const COSMOS_DB_OPERATOR = "230815da-be43-4aae-9cb4-875f7bd000aa";

    const cosmosDbOperator = azurenative.authorization.getRoleDefinitionOutput({
      roleDefinitionId: COSMOS_DB_OPERATOR,
      scope: storageAccount.id,
    });

    new azurenative.authorization.RoleAssignment("functionCosmosDbControlPlaneAccessRole", {
      principalId: identity.principalId,
      principalType: "ServicePrincipal",
      roleDefinitionId: cosmosDbOperator.id,
      scope: cosmosDbAccount.id,
    });

    // Grant access to Cosmos Data Plane
    const sqlRoleDefinitionId = "04e8da3a-6e2b-40be-98d8-d46035af5f0e";
    const sqlRoleDefinition = new azurenative.cosmosdb.SqlResourceSqlRoleDefinition("sqlRoleDefinition", {
      accountName: cosmosDbAccount.name,
      resourceGroupName: resourceGroup.name,
      roleDefinitionId: sqlRoleDefinitionId,
      roleName: "Azure Cosmos DB for NoSQL Data Plane Owner",
      type: "CustomRole",
      assignableScopes: [cosmosDbAccount.id],
      permissions: [
        {
          dataActions: [
            "Microsoft.DocumentDB/databaseAccounts/readMetadata",
            "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/*",
            "Microsoft.DocumentDB/databaseAccounts/sqlDatabases/containers/items/*",
          ],
        },
      ],
    });

    const cosmosDataAccessAssignmentId = new random.RandomUuid("cosmos-data-access-assignment-id").id;

    // Role assignment to allow the function app to access Cosmos DB
    new azurenative.cosmosdb.SqlResourceSqlRoleAssignment("functionCosmosDbRoleAssignment", {
      roleAssignmentId: cosmosDataAccessAssignmentId,
      accountName: cosmosDbAccount.name,
      resourceGroupName: resourceGroup.name,
      roleDefinitionId: sqlRoleDefinition.id,
      principalId: identity.principalId,
      scope: cosmosDbAccount.id,
    });

    // Grant access to Key Vault secrets
    const KEY_VAULT_SECRETS_USER = "4633458b-17de-408a-b874-0445c86b69e6"; // Key Vault Secrets User

    const keyVaultSecretsUserRole = azurenative.authorization.getRoleDefinitionOutput({
      roleDefinitionId: KEY_VAULT_SECRETS_USER,
      scope: storageAccount.id,
    });

    new azurenative.authorization.RoleAssignment("functionAppKeyVaultAccess", {
      principalId: identity.principalId,
      principalType: "ServicePrincipal",
      roleDefinitionId: keyVaultSecretsUserRole.id,
      scope: keyVault.id,
    });

    const roleRandomString = new random.RandomString("role-random-string", {
      length: 8,
    });

    // Grant access to send emails via Communication Services
    const communicationServicesEmailSenderRole = new azurenative.authorization.RoleDefinition(
      "functionAppEmailSenderRole",
      {
        roleName: $interpolate`Communication Services Email Sender ${roleRandomString.result}`,
        permissions: [
          {
            actions: [
              "Microsoft.Communication/CommunicationServices/Read",
              "Microsoft.Communication/EmailServices/read",
              "Microsoft.Communication/EmailServices/write",
              "Microsoft.Communication/EmailServices/Domains/read",
              "Microsoft.Communication/EmailServices/Domains/SenderUsernames/read",
              "Microsoft.Communication/EmailServices/Domains/SuppressionLists/read",
              "Microsoft.Communication/EmailServices/Domains/SuppressionLists/SuppressionListAddresses/read",
              "Microsoft.Communication/Operations/read",
              "Microsoft.Communication/CommunicationServices/Write",
              "Microsoft.Communication/RegisteredSubscriptions/read",
            ],
          },
        ],
        assignableScopes: [communicationService.id],
        scope: communicationService.id,
      }
    );

    new azurenative.authorization.RoleAssignment("functionAppCommunicationServicesEmailSenderRole", {
      principalId: identity.principalId,
      principalType: "ServicePrincipal",
      roleDefinitionId: communicationServicesEmailSenderRole.id,
      scope: communicationService.id,
    });

    new azurenative.authorization.RoleAssignment("functionAppLocalDevCommunicationServicesEmailSenderRole", {
      principalId: azurenative.authorization.getClientConfigOutput().apply((config) => config.objectId),
      principalType: process.env.DEPLOYMENT_USER_PRINCIPAL_TYPE,
      roleDefinitionId: communicationServicesEmailSenderRole.id,
      scope: communicationService.id,
    });

    // Access to the media blob container
    new azurenative.authorization.RoleAssignment("mediaBlobContainerAccess", {
      principalId: userAssignedIdentity.principalId,
      principalType: "ServicePrincipal",
      roleDefinitionId: storageBlobDataContributorRole.id,
      scope: $interpolate`${storageAccount.id}/blobServices/default/containers/${mediaBlobContainer.name}`,
    });

    // AI Search index access
    const SEARCH_INDEX_DATA_CONTRIBUTOR = "8ebe5a00-799e-43f5-93ac-243d3dce84a7";

    const searchIndexDataContributorRole = azurenative.authorization.getRoleDefinitionOutput({
      roleDefinitionId: SEARCH_INDEX_DATA_CONTRIBUTOR,
      scope: aiSearchService.id,
    });

    new azurenative.authorization.RoleAssignment("aiSearchServiceAccess", {
      principalId: identity.principalId,
      principalType: "ServicePrincipal",
      roleDefinitionId: searchIndexDataContributorRole.id,
      scope: aiSearchService.id,
    });
  });

  // Role assignment to allow the function app to read from the storage account
  // This allows the function to access the code in the blob container
  new azurenative.authorization.RoleAssignment("functionDeploymentRole", {
    principalId: userAssignedIdentity.principalId,
    principalType: "ServicePrincipal",
    roleDefinitionId: storageBlobDataContributorRole.id,
    scope: $interpolate`${storageAccount.id}/blobServices/default/containers/${codeContainer.name}`,
  });

  new azurenative.monitor.DiagnosticSetting("function-app-diagnostic-setting", {
    resourceUri: functionApp.id,
    logs: [
      {
        category: "FunctionAppLogs",
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

  return functionApp;
}
