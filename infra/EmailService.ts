export function buildEmailService(resourceGroup: azurenative.resources.ResourceGroup) {
	const emailService = new azurenative.communication.EmailService("email-service", {
		resourceGroupName: resourceGroup.name,
		dataLocation: "UK",
		location: "global",
	});

	// Name must be AzureManagedDomain
	const emailDomain = new azurenative.communication.Domain("AzureManagedDomain", {
		domainManagement: azurenative.communication.DomainManagement.AzureManaged,
		emailServiceName: emailService.name,
		resourceGroupName: resourceGroup.name,
		location: "global",
	});

	return {emailService, emailDomain};
}
