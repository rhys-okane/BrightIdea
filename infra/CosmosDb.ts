export const buildCosmosDb = (
  resourceGroup: azurenative.resources.ResourceGroup,
  applicationInsightsWorkspace: azurenative.operationalinsights.Workspace
) => {
  const cosmosDbAccount = new azurenative.cosmosdb.DatabaseAccount(`cosmosdb-account-${$app.stage}`, {
    resourceGroupName: resourceGroup.name,
    databaseAccountOfferType: azurenative.cosmosdb.DatabaseAccountOfferType.Standard,
    locations: [
      {
        locationName: resourceGroup.location,
        failoverPriority: 0,
      },
    ],
    consistencyPolicy: {
      defaultConsistencyLevel: azurenative.cosmosdb.DefaultConsistencyLevel.Session,
    },
    kind: "GlobalDocumentDB",
    capabilities: [
      {
        name: "EnableServerless",
      },
    ],
    disableLocalAuth: true,
  });

  const cosmosDbDatabase = new azurenative.cosmosdb.SqlResourceSqlDatabase("cosmosdb-database", {
    resourceGroupName: resourceGroup.name,
    accountName: cosmosDbAccount.name,
    resource: {
      id: "cosmosdb-database",
    },
  });

  new azurenative.cosmosdb.SqlResourceSqlContainer("designs-container", {
    resourceGroupName: resourceGroup.name,
    accountName: cosmosDbAccount.name,
    databaseName: cosmosDbDatabase.name,
    resource: {
      id: "designs-container",
      partitionKey: {
        paths: ["/id"],
        kind: "Hash",
      },
      indexingPolicy: {
        indexingMode: "consistent",
        automatic: true,
      },
      uniqueKeyPolicy: {
        uniqueKeys: [
          {
            paths: ["/name"],
          },
        ],
      },
    },
  });

  new azurenative.monitor.DiagnosticSetting("cosmosdb-diagnostic-setting", {
    resourceUri: cosmosDbAccount.id,
    logs: [
      {
        category: "DataPlaneRequests",
        enabled: true,
        retentionPolicy: {
          days: 0,
          enabled: false,
        },
      },
      {
        category: "DataPlaneRequests5M",
        enabled: true,
        retentionPolicy: {
          days: 0,
          enabled: false,
        },
      },
      {
        category: "DataPlaneRequests15M",
        enabled: true,
        retentionPolicy: {
          days: 0,
          enabled: false,
        },
      },
      {
        category: "QueryRuntimeStatistics",
        enabled: true,
        retentionPolicy: {
          days: 0,
          enabled: false,
        },
      },
      {
        category: "PartitionKeyStatistics",
        enabled: true,
        retentionPolicy: {
          days: 0,
          enabled: false,
        },
      },
      {
        category: "PartitionKeyRUConsumption",
        enabled: true,
        retentionPolicy: {
          days: 0,
          enabled: false,
        },
      },
      {
        category: "ControlPlaneRequests",
        enabled: true,
        retentionPolicy: {
          days: 0,
          enabled: false,
        },
      },
      {
        category: "TableApiRequests",
        enabled: true,
        retentionPolicy: {
          days: 0,
          enabled: false,
        },
      },
    ],
    metrics: [],
    workspaceId: applicationInsightsWorkspace.id,
  });

  return { cosmosDbDatabase, cosmosDbAccount };
};
