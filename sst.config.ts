/// <reference path="./.sst/platform/config.d.ts" />

import path = require("path");

export default $config({
  app(input) {
    return {
      name: "brightidea",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "local",
      providers: {
        "azure-native": {
          version: "3.8.0",
          location: "UK South",
        },
        random: "4.18.2",
        command: "1.1.3",
      },
    };
  },
  async run() {
    const { buildKeyVault } = await import("./infra/KeyVault");
    const { buildStaticSite } = await import("./infra/StaticSite");
    const { buildFunctionApp } = await import("./infra/FunctionApp");
    const { buildApplicationInsights } = await import(
      "./infra/ApplicationInsights"
    );
    const { buildCosmosDb } = await import("./infra/CosmosDb");
    const { buildEmailService } = await import("./infra/EmailService");
    const { buildMediaBlobContainer } = await import(
      "./infra/MediaBlobContainer"
    );
    const { buildAiSearch } = await import("./infra/AISearch");

    const resourceGroup = new azurenative.resources.ResourceGroup(
      "BrightIdeaDevResourceGroup"
    );
    const storageAccount = new azurenative.storage.StorageAccount(
      "storageaccount",
      {
        resourceGroupName: resourceGroup.name,
        sku: {
          name: azurenative.storage.SkuName.Standard_LRS,
        },
        accessTier: azurenative.storage.AccessTier.Hot,
        kind: "StorageV2",
      }
    );
    const storageAccountKeys = azurenative.storage.listStorageAccountKeysOutput(
      {
        resourceGroupName: resourceGroup.name,
        accountName: storageAccount.name,
      }
    );

    // Wait for the storage account and resource group to be created before deploying further resources
    const { functionApp, cosmosDbAccount, emailDomain, aiSearchService } =
      $resolve([storageAccount, resourceGroup] as const).apply(
        async ([storageAccount, resourceGroup]) => {
          const { keyVault, turnstileSecret } = buildKeyVault(resourceGroup);
          const applicationInsights = buildApplicationInsights(resourceGroup);
          const { cosmosDbAccount } = buildCosmosDb(
            resourceGroup,
            storageAccount
          );
          const { emailService, emailDomain } =
            buildEmailService(resourceGroup);
          const mediaBlobContainer = buildMediaBlobContainer(
            resourceGroup,
            storageAccount
          );
          const { aiSearchService } = await buildAiSearch(resourceGroup);

          const functionApp = await buildFunctionApp({
            storageAccount,
            resourceGroup,
            turnstileSecret,
            applicationInsights,
            cosmosDbAccount,
            keyVault,
            emailService,
            emailDomain,
            mediaBlobContainer,
            aiSearchService,
          });

          buildStaticSite(storageAccount, resourceGroup, functionApp);

          return {
            functionApp,
            cosmosDbAccount,
            emailDomain,
            aiSearchService,
          };
        }
      );

    return {
      primaryStorageKey: storageAccountKeys.keys[0].value,
      websiteUrl: storageAccount.primaryEndpoints.web,
      resourceGroupName: resourceGroup.name,
      functionAppName: functionApp.name,
      cosmosDbEndpoint: cosmosDbAccount.documentEndpoint,
      emailDomain: emailDomain.fromSenderDomain,
      aiSearchEndpoint: aiSearchService.endpoint,
    };
  },
});
