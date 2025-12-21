export const buildApplicationInsights = (resourceGroup: azurenative.resources.ResourceGroup) => {
	const logAnalytics = new azurenative.operationalinsights.Workspace("logAnalytics", {
		workspaceName: "my-log-analytics",
		resourceGroupName: resourceGroup.name,
		location: resourceGroup.location,
		sku: {
			name: azurenative.operationalinsights.WorkspaceSkuNameEnum.PerGB2018,
		},
		retentionInDays: 30,
	});

	return new azurenative.applicationinsights.Component("app-insights", {
		location: resourceGroup.location,
		resourceGroupName: resourceGroup.name,
		applicationType: azurenative.applicationinsights.ApplicationType.Web,
		kind: azurenative.applicationinsights.ApplicationType.Web,
		retentionInDays: 30,
		workspaceResourceId: logAnalytics.id,
		ingestionMode: azurenative.applicationinsights.IngestionMode.LogAnalytics,
	});
};
