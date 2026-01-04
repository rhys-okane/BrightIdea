export const buildApplicationInsights = (
  resourceGroup: azurenative.resources.ResourceGroup
) => {
  const workspace = new azurenative.operationalinsights.Workspace(
    "logAnalyticsWorkspace",
    {
      workspaceName: "bright-idea-log-analytics-workspace",
      resourceGroupName: resourceGroup.name,
      location: resourceGroup.location,
      sku: {
        name: azurenative.operationalinsights.WorkspaceSkuNameEnum.PerGB2018,
      },
      retentionInDays: 30,
    }
  );

  const component = new azurenative.applicationinsights.Component(
    "app-insights",
    {
      location: resourceGroup.location,
      resourceGroupName: resourceGroup.name,
      applicationType: azurenative.applicationinsights.ApplicationType.Web,
      kind: azurenative.applicationinsights.ApplicationType.Web,
      retentionInDays: 30,
      workspaceResourceId: workspace.id,
      ingestionMode: azurenative.applicationinsights.IngestionMode.LogAnalytics,
    }
  );

  return {
    component,
    workspace,
  };
};
