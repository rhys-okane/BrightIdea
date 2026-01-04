export function buildEmailService(
  resourceGroup: azurenative.resources.ResourceGroup,
  applicationInsightsWorkspace: azurenative.operationalinsights.Workspace
) {
  const emailService = new azurenative.communication.EmailService(
    "email-service",
    {
      resourceGroupName: resourceGroup.name,
      dataLocation: "UK",
      location: "global",
    }
  );

  // Name must be AzureManagedDomain
  const emailDomain = new azurenative.communication.Domain(
    "AzureManagedDomain",
    {
      domainManagement: azurenative.communication.DomainManagement.AzureManaged,
      emailServiceName: emailService.name,
      resourceGroupName: resourceGroup.name,
      location: "global",
    }
  );

  const communicationService =
    new azurenative.communication.CommunicationService(
      "communication-service",
      {
        dataLocation: "UK",
        resourceGroupName: resourceGroup.name,
        location: "global",
        linkedDomains: [emailDomain.id],
      }
    );

  new azurenative.monitor.DiagnosticSetting(
    "email-service-diagnostic-setting",
    {
      resourceUri: communicationService.id,
      logs: [
        {
          category: "Usage",
          enabled: true,
          retentionPolicy: {
            days: 0,
            enabled: false,
          },
        },
        {
          category: "EmailSendMailOperational",
          enabled: true,
          retentionPolicy: {
            days: 0,
            enabled: false,
          },
        },
        {
          category: "EmailStatusUpdateOperational",
          enabled: true,
          retentionPolicy: {
            days: 0,
            enabled: false,
          },
        },
        {
          category: "EmailUserEngagementOperational",
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
          retentionPolicy: {
            days: 0,
            enabled: false,
          },
          category: "Traffic",
        },
      ],
      workspaceId: applicationInsightsWorkspace.id,
    }
  );

  return { communicationService, emailService, emailDomain };
}
